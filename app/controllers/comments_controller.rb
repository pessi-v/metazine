class CommentsController < ApplicationController
  before_action :require_login
  before_action :set_parent, only: [:create]
  before_action :set_comment, only: [:update, :destroy]

  # POST /articles/:article_id/comments
  def create
    begin
      # Check if user has federails_actor - try to link if missing
      unless current_user.federails_actor
        Rails.logger.warn "User #{current_user.id} (#{current_user.username}@#{current_user.domain}) has no federails_actor, attempting to link..."
        current_user.link_to_federated_actor!
        current_user.reload

        unless current_user.federails_actor
          Rails.logger.error "Failed to link user to federails_actor"
          flash[:alert] = "Your account is not properly linked. Please log out and log back in to enable commenting."
          redirect_back fallback_location: frontpage_path
          return
        end

        Rails.logger.info "Successfully linked user to federails_actor #{current_user.federails_actor.id}"
      end

      # Post to user's Mastodon outbox first
      mastodon_client = MastodonApiClient.new(current_user)
      mastodon_response = mastodon_client.create_comment(
        content: comment_params[:content],
        parent: @parent
      )

      # Create local comment with Mastodon's federated_url
      # Use insert! to completely bypass Federails callbacks
      comment_attributes = {
        parent_type: @parent.class.name,
        parent_id: @parent.id,
        content: comment_params[:content],
        user_id: current_user.id,
        federails_actor_id: current_user.federails_actor.id,
        federated_url: mastodon_response[:uri], # Use ActivityPub URI, not web URL
        created_at: Time.current,
        updated_at: Time.current
      }

      # insert! returns the inserted record's primary key
      result = Comment.insert!(comment_attributes)
      comment_id = result.is_a?(Hash) ? result["id"] : result
      Rails.logger.info "Created comment #{comment_id} with federated_url: #{mastodon_response[:uri]}"

      redirect_back fallback_location: frontpage_path, notice: "Comment posted successfully!"
    rescue ActiveRecord::RecordInvalid => e
      Rails.logger.error "Failed to save comment: #{e.message}"
      Rails.logger.error e.backtrace.first(10).join("\n")
      redirect_back fallback_location: frontpage_path, alert: "Failed to save comment: #{e.message}"
    rescue MastodonApiClient::Error => e
      Rails.logger.error "Failed to post to Mastodon: #{e.message}"

      # Check if it's a scope error
      if e.message.include?("authorized scopes") || e.message.include?("Forbidden")
        redirect_back fallback_location: frontpage_path, alert: "Your Mastodon login needs to be refreshed. Please log out and log back in to enable commenting."
      else
        redirect_back fallback_location: frontpage_path, alert: "Failed to post comment to Mastodon: #{e.message}"
      end
    end
  end

  # PATCH /comments/:id
  def update
    unless @comment.owned_by?(current_user)
      redirect_back fallback_location: frontpage_path, alert: "You can only edit your own comments."
      return
    end

    begin
      # Extract status ID from federated_url
      status_id = extract_mastodon_status_id(@comment.federated_url)

      if status_id
        # Update on Mastodon first
        mastodon_client = MastodonApiClient.new(current_user)
        mastodon_client.update_comment(
          status_id: status_id,
          content: comment_params[:content]
        )
      end

      # Update local comment directly to bypass Federails
      @comment.update_columns(
        content: comment_params[:content],
        updated_at: Time.current
      )

      redirect_back fallback_location: frontpage_path, notice: "Comment updated successfully."
    rescue MastodonApiClient::Error => e
      Rails.logger.error "Failed to update on Mastodon: #{e.message}"
      redirect_back fallback_location: frontpage_path, alert: "Failed to update comment on Mastodon: #{e.message}"
    end
  end

  # DELETE /comments/:id
  def destroy
    unless @comment.owned_by?(current_user)
      redirect_back fallback_location: frontpage_path, alert: "You can only delete your own comments."
      return
    end

    begin
      # Extract status ID from federated_url
      status_id = extract_mastodon_status_id(@comment.federated_url)

      if status_id
        # Delete on Mastodon first
        mastodon_client = MastodonApiClient.new(current_user)
        mastodon_client.delete_comment(status_id: status_id)
      end

      # Soft delete locally - update_columns bypasses Federails callbacks
      @comment.update_columns(
        deleted_at: Time.current,
        content: "[deleted]",
        user_id: nil
      )

      redirect_back fallback_location: frontpage_path, notice: "Comment deleted successfully."
    rescue MastodonApiClient::Error => e
      Rails.logger.error "Failed to delete on Mastodon: #{e.message}"
      redirect_back fallback_location: frontpage_path, alert: "Failed to delete comment on Mastodon: #{e.message}"
    end
  end

  private

  def set_parent
    # Support both articles and comments as parents (for nested comments)
    if params[:article_id]
      @parent = Article.find(params[:article_id])
    elsif params[:comment_id]
      @parent = Comment.find(params[:comment_id])
    else
      redirect_back fallback_location: frontpage_path, alert: "Invalid parent for comment"
    end
  end

  def set_comment
    @comment = Comment.find(params[:id])
  end

  def comment_params
    params.require(:comment).permit(:content)
  end

  def extract_mastodon_status_id(url)
    return nil unless url.present?

    # Try to match common Mastodon URL patterns
    # Examples:
    #   https://mastodon.social/@user/123456789 -> 123456789
    #   https://mastodon.social/users/user/statuses/123456789 -> 123456789
    #   https://mastodon.social/ap/users/115452228256174584/statuses/115453395430281063 -> 115453395430281063
    if url =~ %r{/statuses/(\d+)}
      $1
    elsif url =~ %r{/@[^/]+/(\d+)}
      $1
    else
      Rails.logger.warn "Could not extract status ID from: #{url}"
      nil
    end
  end
end
