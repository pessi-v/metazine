class CommentsController < ApplicationController
  def create
    # binding.break
    Comment.create(content: params['content'], parent_type: 'Article', parent_id: params['article_id'], federails_actor_id: Current.user.federails_actor.id)
    redirect_back(fallback_location: frontpage_path)
  end

  def update
  end

  def destroy
  end
end
