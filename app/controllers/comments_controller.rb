class CommentsController < ApplicationController
  def create
    article_id = params['article_id']
    Comment.create(
      content: params['content'],
      parent_type: 'Article',
      parent_id: article_id,
      federails_actor_id: Current.user.federails_actor.id
    )
    
    redirect_to "#{reader_path(article_id)}#discussion"
  end

  def update
  end

  def destroy
  end
end
