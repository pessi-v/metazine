class CommentsController < ApplicationController
  before_action :require_login
  before_action :set_parent, only: [:create]
  before_action :set_comment, only: [:update, :destroy]

  # POST /articles/:article_id/comments
  def create
    @comment = @parent.comments.build(comment_params)
    @comment.user = current_user
    @comment.federails_actor = current_user.federails_actor

    if @comment.save
      redirect_back fallback_location: frontpage_path, notice: "Comment posted successfully!"
    else
      redirect_back fallback_location: frontpage_path, alert: "Failed to post comment: #{@comment.errors.full_messages.join(', ')}"
    end
  end

  # PATCH /comments/:id
  def update
    if @comment.user == current_user
      if @comment.update(comment_params)
        redirect_back fallback_location: frontpage_path, notice: "Comment updated successfully."
      else
        redirect_back fallback_location: frontpage_path, alert: "Failed to update comment: #{@comment.errors.full_messages.join(', ')}"
      end
    else
      redirect_back fallback_location: frontpage_path, alert: "You can only edit your own comments."
    end
  end

  # DELETE /comments/:id
  def destroy
    if @comment.user == current_user
      @comment.soft_delete!
      redirect_back fallback_location: frontpage_path, notice: "Comment deleted successfully."
    else
      redirect_back fallback_location: frontpage_path, alert: "You can only delete your own comments."
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
