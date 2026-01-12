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

      content = comment_params[:content]

      # If user is logged in via Mastodon (has access_token), post to their Mastodon outbox
      if current_user.access_token.present? && current_user.domain.present?
        Rails.logger.info "=== Creating comment in user's Mastodon outbox ==="
        Rails.logger.info "  User: #{current_user.full_username}"
        Rails.logger.info "  Parent: #{@parent.class.name}##{@parent.id}"

        # If parent is an Article that hasn't been federated yet, federate it NOW
        # This ensures the comment can reply to the article properly
        if @parent.is_a?(Article) && @parent.federated_url.blank?
          Rails.logger.info "  Article not yet federated - federating now before posting comment"

          # Generate the federated_url for the Article
          host = Rails.application.routes.default_url_options[:host] || ENV["APP_HOST"] || "localhost:3000"
          article_url = "https://#{host}/federation/published/articles/#{@parent.id}"

          # Set the federated_url on the Article
          @parent.update_column(:federated_url, article_url)
          Rails.logger.info "  Set Article federated_url: #{article_url}"

          # Create a Federails Activity for the Article
          article_activity = Federails::Activity.create!(
            actor: @parent.federails_actor,
            entity: @parent,
            action: 'Create'
          )

          # Enqueue the federation job
          Federails::NotifyInboxJob.perform_later(article_activity)

          Rails.logger.info "  Article federation Activity##{article_activity.id} created and enqueued"
        end

        # Initialize Mastodon API client
        mastodon_client = MastodonApiClient.new(current_user)

        # Post to Mastodon outbox (now the article has federated_url if needed)
        result = mastodon_client.create_comment(
          content: content,
          parent: @parent
        )

        Rails.logger.info "  Successfully posted to Mastodon"
        Rails.logger.info "  Status URL: #{result[:url]}"
        Rails.logger.info "  Status URI: #{result[:uri]}"

        # Create comment locally with federated_url from Mastodon
        comment = Comment.new(
          parent: @parent,
          content: content,
          user_id: current_user.id,
          federails_actor: current_user.federails_actor,
          federated_url: result[:uri] || result[:url] # Use URI (ActivityPub ID) or fallback to URL
        )

        # Skip Federails callbacks since we already posted to Mastodon
        comment.skip_federails_callbacks = true

        if comment.save
          Rails.logger.info "  Saved comment #{comment.id} locally with federated_url"

          # Announce the comment to followers of the instance actor
          # This ensures followers on other instances see the comment
          ActivityPub::AnnounceCommentService.call(comment)

          respond_to do |format|
            format.turbo_stream { @comment = comment }
            format.html { redirect_back fallback_location: frontpage_path, notice: "Comment posted successfully to Mastodon!" }
          end
        else
          Rails.logger.error "  Failed to save comment locally: #{comment.errors.full_messages.join(', ')}"
          respond_to do |format|
            format.turbo_stream { render turbo_stream: turbo_stream.replace("new_comment_form", partial: "comments/comment_form", locals: { parent: @parent, comment: comment }), status: :unprocessable_entity }
            format.html { redirect_back fallback_location: frontpage_path, alert: "Posted to Mastodon but failed to save locally: #{comment.errors.full_messages.join(', ')}" }
          end
        end
      else
        # User doesn't have Mastodon credentials - fall back to local-only comment
        Rails.logger.info "Creating local-only comment (user has no Mastodon credentials)"

        comment = Comment.new(
          parent: @parent,
          content: content,
          user_id: current_user.id,
          federails_actor: current_user.federails_actor
        )

        if comment.save
          Rails.logger.info "Created comment #{comment.id}, federating via ActivityPub"
          respond_to do |format|
            format.turbo_stream { @comment = comment }
            format.html { redirect_back fallback_location: frontpage_path, notice: "Comment posted successfully!" }
          end
        else
          Rails.logger.error "Failed to save comment: #{comment.errors.full_messages.join(', ')}"
          respond_to do |format|
            format.turbo_stream { render turbo_stream: turbo_stream.replace("new_comment_form", partial: "comments/comment_form", locals: { parent: @parent, comment: comment }), status: :unprocessable_entity }
            format.html { redirect_back fallback_location: frontpage_path, alert: "Failed to save comment: #{comment.errors.full_messages.join(', ')}" }
          end
        end
      end
    rescue MastodonApiClient::Error => e
      Rails.logger.error "Mastodon API error creating comment: #{e.message}"
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace("new_comment_form", partial: "comments/comment_form", locals: { parent: @parent, comment: Comment.new(content: content) }), status: :unprocessable_entity }
        format.html { redirect_back fallback_location: frontpage_path, alert: "Failed to post comment to Mastodon: #{e.message}" }
      end
    rescue ActiveRecord::RecordInvalid => e
      Rails.logger.error "Failed to save comment: #{e.message}"
      Rails.logger.error e.backtrace.first(10).join("\n")
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace("new_comment_form", partial: "comments/comment_form", locals: { parent: @parent, comment: Comment.new(content: content) }), status: :unprocessable_entity }
        format.html { redirect_back fallback_location: frontpage_path, alert: "Failed to save comment: #{e.message}" }
      end
    end
  end

  # PATCH /comments/:id
  def update
    unless @comment.owned_by?(current_user)
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace("comment_#{@comment.id}", partial: "comments/reader_comment", locals: { comment: @comment, depth: @comment.parent.is_a?(Article) ? 0 : 1 }), status: :forbidden }
        format.html { redirect_back fallback_location: frontpage_path, alert: "You can only edit your own comments." }
      end
      return
    end

    begin
      new_content = comment_params[:content]

      # If comment is federated (created on remote Mastodon instance),
      # update it in the remote actor's outbox via Mastodon API
      if @comment.federated? && @comment.mastodon_status_id.present?
        Rails.logger.info "=== Updating federated comment #{@comment.id} on remote Mastodon instance ==="
        Rails.logger.info "  Federated URL: #{@comment.federated_url}"
        Rails.logger.info "  Status ID: #{@comment.mastodon_status_id}"

        # Initialize Mastodon API client with user's access token
        mastodon_client = MastodonApiClient.new(current_user)

        # Update the status on the remote Mastodon instance
        result = mastodon_client.update_comment(
          status_id: @comment.mastodon_status_id,
          content: new_content
        )

        Rails.logger.info "  Successfully updated remote status"
        Rails.logger.info "  Result: #{result.inspect}"

        # Update the local comment to reflect the change
        # Skip Federails callbacks since we've already handled the remote update
        @comment.skip_federails_callbacks = true
        if @comment.update(content: new_content)
          # Note: No need to re-announce - the existing Announce points to the comment URL,
          # and when fetched, it will show the updated content automatically
          respond_to do |format|
            format.turbo_stream
            format.html { redirect_back fallback_location: frontpage_path, notice: "Comment updated successfully on Mastodon." }
          end
        else
          Rails.logger.error "Failed to update local comment: #{@comment.errors.full_messages.join(', ')}"
          respond_to do |format|
            format.turbo_stream { render turbo_stream: turbo_stream.replace("comment_#{@comment.id}", partial: "comments/reader_comment", locals: { comment: @comment, depth: @comment.parent.is_a?(Article) ? 0 : 1 }), status: :unprocessable_entity }
            format.html { redirect_back fallback_location: frontpage_path, alert: "Remote update succeeded but local sync failed: #{@comment.errors.full_messages.join(', ')}" }
          end
        end
      else
        # Local comment or ActivityPub federated comment - update locally and let Federails handle federation
        if @comment.update(content: new_content)
          Rails.logger.info "Updated comment #{@comment.id}, federating Update activity"
          respond_to do |format|
            format.turbo_stream
            format.html { redirect_back fallback_location: frontpage_path, notice: "Comment updated successfully." }
          end
        else
          Rails.logger.error "Failed to update comment: #{@comment.errors.full_messages.join(', ')}"
          respond_to do |format|
            format.turbo_stream { render turbo_stream: turbo_stream.replace("comment_#{@comment.id}", partial: "comments/reader_comment", locals: { comment: @comment, depth: @comment.parent.is_a?(Article) ? 0 : 1 }), status: :unprocessable_entity }
            format.html { redirect_back fallback_location: frontpage_path, alert: "Failed to update comment: #{@comment.errors.full_messages.join(', ')}" }
          end
        end
      end
    rescue MastodonApiClient::Error => e
      Rails.logger.error "Mastodon API error updating comment: #{e.message}"
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace("comment_#{@comment.id}", partial: "comments/reader_comment", locals: { comment: @comment, depth: @comment.parent.is_a?(Article) ? 0 : 1 }), status: :unprocessable_entity }
        format.html { redirect_back fallback_location: frontpage_path, alert: "Failed to update comment on Mastodon: #{e.message}" }
      end
    rescue ActiveRecord::RecordInvalid => e
      Rails.logger.error "Failed to update comment: #{e.message}"
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace("comment_#{@comment.id}", partial: "comments/reader_comment", locals: { comment: @comment, depth: @comment.parent.is_a?(Article) ? 0 : 1 }), status: :unprocessable_entity }
        format.html { redirect_back fallback_location: frontpage_path, alert: "Failed to update comment: #{e.message}" }
      end
    end
  end

  # DELETE /comments/:id
  def destroy
    unless @comment.owned_by?(current_user)
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace("comment_#{@comment.id}", partial: "comments/reader_comment", locals: { comment: @comment, depth: @comment.parent.is_a?(Article) ? 0 : 1 }), status: :forbidden }
        format.html { redirect_back fallback_location: frontpage_path, alert: "You can only delete your own comments." }
      end
      return
    end

    begin
      # If comment is federated (created on remote Mastodon instance),
      # delete it from the remote actor's outbox via Mastodon API
      if @comment.federated? && @comment.mastodon_status_id.present?
        Rails.logger.info "=== Deleting federated comment #{@comment.id} from remote Mastodon instance ==="
        Rails.logger.info "  Federated URL: #{@comment.federated_url}"
        Rails.logger.info "  Status ID: #{@comment.mastodon_status_id}"

        # Initialize Mastodon API client with user's access token
        mastodon_client = MastodonApiClient.new(current_user)

        # Delete the status on the remote Mastodon instance
        mastodon_client.delete_comment(status_id: @comment.mastodon_status_id)

        Rails.logger.info "  Successfully deleted remote status"

        # Soft delete the local comment
        # Skip Federails callbacks since we've already handled the remote deletion
        @comment.update_columns(
          deleted_at: Time.current,
          content: "[deleted]",
          user_id: nil
        )

        respond_to do |format|
          format.turbo_stream
          format.html { redirect_back fallback_location: frontpage_path, notice: "Comment deleted successfully from Mastodon." }
        end
      else
        # Local comment or ActivityPub federated comment - use destroy to trigger Federails Delete activity
        @comment.destroy

        Rails.logger.info "Deleted comment #{@comment.id}, federating Delete activity"
        respond_to do |format|
          format.turbo_stream
          format.html { redirect_back fallback_location: frontpage_path, notice: "Comment deleted successfully." }
        end
      end
    rescue MastodonApiClient::Error => e
      Rails.logger.error "Mastodon API error deleting comment: #{e.message}"
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace("comment_#{@comment.id}", partial: "comments/reader_comment", locals: { comment: @comment, depth: @comment.parent.is_a?(Article) ? 0 : 1 }), status: :unprocessable_entity }
        format.html { redirect_back fallback_location: frontpage_path, alert: "Failed to delete comment on Mastodon: #{e.message}" }
      end
    rescue => e
      Rails.logger.error "Failed to delete comment: #{e.message}"
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace("comment_#{@comment.id}", partial: "comments/reader_comment", locals: { comment: @comment, depth: @comment.parent.is_a?(Article) ? 0 : 1 }), status: :unprocessable_entity }
        format.html { redirect_back fallback_location: frontpage_path, alert: "Failed to delete comment: #{e.message}" }
      end
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
end
