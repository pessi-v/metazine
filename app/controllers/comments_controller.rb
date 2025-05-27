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
  end
end
