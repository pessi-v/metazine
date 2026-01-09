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

      # Create comment locally and let Federails handle federation
      comment = Comment.new(
        parent: @parent,
        content: comment_params[:content],
        user_id: current_user.id,
        federails_actor: current_user.federails_actor
      )

      if comment.save
        Rails.logger.info "Created comment #{comment.id}, federating via ActivityPub"
        redirect_back fallback_location: frontpage_path, notice: "Comment posted successfully!"
      else
        Rails.logger.error "Failed to save comment: #{comment.errors.full_messages.join(', ')}"
        redirect_back fallback_location: frontpage_path, alert: "Failed to save comment: #{comment.errors.full_messages.join(', ')}"
      end
    rescue ActiveRecord::RecordInvalid => e
      Rails.logger.error "Failed to save comment: #{e.message}"
      Rails.logger.error e.backtrace.first(10).join("\n")
      redirect_back fallback_location: frontpage_path, alert: "Failed to save comment: #{e.message}"
    end
  end

  # PATCH /comments/:id
  def update
    unless @comment.owned_by?(current_user)
      redirect_back fallback_location: frontpage_path, alert: "You can only edit your own comments."
      return
    end

    begin
      # Update locally and let Federails handle federation
      if @comment.update(content: comment_params[:content])
        Rails.logger.info "Updated comment #{@comment.id}, federating Update activity"
        redirect_back fallback_location: frontpage_path, notice: "Comment updated successfully."
      else
        Rails.logger.error "Failed to update comment: #{@comment.errors.full_messages.join(', ')}"
        redirect_back fallback_location: frontpage_path, alert: "Failed to update comment: #{@comment.errors.full_messages.join(', ')}"
      end
    rescue ActiveRecord::RecordInvalid => e
      Rails.logger.error "Failed to update comment: #{e.message}"
      redirect_back fallback_location: frontpage_path, alert: "Failed to update comment: #{e.message}"
    end
  end

  # DELETE /comments/:id
  def destroy
    unless @comment.owned_by?(current_user)
      redirect_back fallback_location: frontpage_path, alert: "You can only delete your own comments."
      return
    end

    begin
      # Use destroy to trigger Federails Delete activity, which then soft deletes
      # via the before_destroy callback
      @comment.destroy

      Rails.logger.info "Deleted comment #{@comment.id}, federating Delete activity"
      redirect_back fallback_location: frontpage_path, notice: "Comment deleted successfully."
    rescue => e
      Rails.logger.error "Failed to delete comment: #{e.message}"
      redirect_back fallback_location: frontpage_path, alert: "Failed to delete comment: #{e.message}"
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
