class ArticlesController < ApplicationController

  def frontpage
    latest_articles
  end

  def search
    @articles = Article.search_by_title_source_and_readability_output(params[:query]).to_a.sort_by { |a| a.published_at }.reverse
    render :list
  end
  
  def articles_by_source
    # binding.break
    @articles = Article.where(source_name: params[:source_name]).order(published_at: :desc)
    render :list
  end

  def list
    latest_articles
  end

  def reader
    @article = Article.find(params[:id])

    if !@article.readability_output
      set_article_readability_output(@article)
    end

    readability_output = eval @article.readability_output
    
    @title = readability_output['title']
    @author = readability_output['byline']
    @content = readability_output['content'].gsub('class="page"', '')

    respond_to do |format|
      format.html
      format.json { render json: @article }
    end
  end

  def vits
  end
  
  private
    def latest_articles
      @articles = Article.order(published_at: :desc).first(30)
    end

    def set_article_readability_output(article)
      response = Faraday.get(article.url)
      
      runner = NodeRunner.new(
        <<~JAVASCRIPT
        const { Readability } = require('@mozilla/readability');
        const jsdom = require("jsdom");
        const { JSDOM } = jsdom;        
        const parse = (document) => {
          const dom = new JSDOM(document);
          return new Readability(dom.window.document).parse()
        }
        JAVASCRIPT
      )
      readability_output = runner.parse response.body
      article.readability_output = readability_output
      article.save
    end

    # Only allow a list of trusted parameters through.
    def article_params
      params.require(:article).permit(:title, :image_url, :url, :preview_text, :allow_video, :allow_audio)
    end
end
