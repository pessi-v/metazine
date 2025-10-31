class CommentsController < ApplicationController
  before_action :require_login
  before_action :set_parent, only: [:create]
  before_action :set_comment, only: [:update, :destroy]

  # POST /articles/:article_id/comments
  def create
    begin
      # Post to user's Mastodon outbox first
      mastodon_client = MastodonApiClient.new(current_user)
      mastodon_response = mastodon_client.create_comment(
        content: comment_params[:content],
        parent: @parent
      )

      # Create local comment with Mastodon's federated_url
      @comment = @parent.comments.build(comment_params)
      @comment.user = current_user
      @comment.federails_actor = current_user.federails_actor
      @comment.federated_url = mastodon_response[:uri] # Use ActivityPub URI, not web URL
      @comment.skip_federails_callbacks = true # Don't federate again

      if @comment.save
        redirect_back fallback_location: frontpage_path, notice: "Comment posted successfully!"
      else
        redirect_back fallback_location: frontpage_path, alert: "Failed to post comment: #{@comment.errors.full_messages.join(', ')}"
      end
    rescue MastodonApiClient::Error => e
      Rails.logger.error "Failed to post to Mastodon: #{e.message}"
      redirect_back fallback_location: frontpage_path, alert: "Failed to post comment to Mastodon: #{e.message}"
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

      # Update local comment
      @comment.skip_federails_callbacks = true
      if @comment.update(comment_params)
        redirect_back fallback_location: frontpage_path, notice: "Comment updated successfully."
      else
        redirect_back fallback_location: frontpage_path, alert: "Failed to update comment: #{@comment.errors.full_messages.join(', ')}"
      end
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

      # Soft delete locally
      @comment.skip_federails_callbacks = true
      @comment.soft_delete!
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
