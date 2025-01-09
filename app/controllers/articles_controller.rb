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

    @text_to_speech_content = readability_output['content']
      .scan(/<p>(.*?)<\/p>/m)
      .flatten
      .map { |text| text.gsub(/<\/?[^>]*>/, '') }
      .to_json

    # headers['Cross-Origin-Opener-Policy'] = 'same-origin'
    # headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
    
    respond_to do |format|
      format.html
      format.json { render json: @article }
    end
  end
  
  private
    # def add_crossorigin_to_images(content)
    #   # Parse the HTML content
    #   doc = Nokogiri::HTML(content)
      
    #   # Find all img tags
    #   doc.css('img').each do |img|
    #     # Add crossorigin attribute if it doesn't exist
    #     unless img.has_attribute?('crossorigin')
    #       img['crossorigin'] = 'anonymous'
    #     end
    #   end
      
    #   # Return the modified HTML
    #   doc.to_html
    # end

    # def extract_text_content(content)
    #   require 'nokogiri'
      
    #   # Parse the HTML content
    #   doc = Nokogiri::HTML(content)
      
    #   # Select all header tags (h1-h6) and p tags, then extract their text content
    #   text_content = doc.css('h1, h2, h3, h4, h5, h6, p').map(&:text).join("\n")
      
    #   # Remove extra whitespace and normalize line breaks
    #   text_content = text_content.strip.gsub(/\s+/, ' ')
    # rescue => e
    #   render json: { error: "Failed to parse HTML: #{e.message}" }, status: :unprocessable_entity
    # end

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
