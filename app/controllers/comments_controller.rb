class CommentsController < ApplicationController
  def create
    Comment.new(content: nil)
  end

  def update
  end

  def destroy
  end
end
