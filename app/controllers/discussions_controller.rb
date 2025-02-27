# frozen_string_literal: true

class DiscussionsController < ApplicationController
  before_action :set_article, except: [:index, :discuss]

  def discuss
    article = Article.find(params[:id])
    unless article.has_discussion?
      article.start_discussion
    end
    
    # binding.break
    article.discussion.add_comment(params[:content])
    # binding.break
    # binding.pry
    redirect_to reader_path(params[:id])
  end
  
  def index
    @discussions = Discussion.all.order(created_at: :desc)
  end
  
  def new
    @discussion = Discussion.new
  end
  
  def create
    @discussion = @article.discussions.build(discussion_params)
    
    respond_to do |format|
      if @discussion.save
        # Handle ActivityPub federation here
        # publish_to_federation(@discussion)
        
        format.html { redirect_to article_discussion_path(@article, @discussion), notice: 'Discussion started successfully.' }
        format.json { render :show, status: :created, location: article_discussion_path(@article, @discussion) }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @discussion.errors, status: :unprocessable_entity }
      end
    end
  end
  
  def show
    @discussion = @article.discussions.find(params[:id])
    @comments = @discussion.comments.order(created_at: :asc)
    @comment = Comment.new
  end
  
  private
  
  def set_article
    @article = Article.find(params[:article_id])
  end
  
  def discussion_params
    params.require(:discussion).permit(:title, :content)
  end
  
  # Placeholder for ActivityPub federation
  # def publish_to_federation(discussion)
  #   # Integration with Federails or custom federation code
  # end
end
