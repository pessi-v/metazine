class CommentsController < ApplicationController
  def create
    # binding.break
    # article_id = params["article_id"]
    Comment.create(
      content: params["content"],
      parent_type: params["parent_type"],
      parent_id: params["parent_id"],
      federails_actor_id: Current.user.federails_actor.id
    )

    # redirect_to "#{reader_path(article_id)}#discussion"
    redirect_back fallback_location: frontpage_path
  end

  def update
  end

  def destroy
    # binding.break
    @comment = Comment.find(params[:id])
    @article = Article.find(params[:article_id])

    if @comment.semi_delete!
      respond_to do |format|
        format.html { redirect_back(fallback_location: root_path, notice: "Comment deleted successfully.") }
        format.json { render json: {status: "deleted", message: "Comment deleted successfully."} }
        # format.turbo_stream { render turbo_stream: turbo_stream.replace(@comment, partial: "comments/reader_comment", locals: {comment: @comment, depth: 0}) }
      end
    else
      respond_to do |format|
        format.html { redirect_back(fallback_location: root_path, alert: "Failed to delete comment.") }
        format.json { render json: {error: "Failed to delete comment."}, status: :unprocessable_entity }
      end
    end
  end
end
