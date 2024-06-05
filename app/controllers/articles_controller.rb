class ArticlesController < ApplicationController

  before_action :set_article, only: %i[ show edit update destroy ]

  def frontpage
    # @articles = Article.last(15)
    @articles = Article.order(published_at: :desc).first(15)
    # @articles_without_images = articles.select { |article| !article.image_url }
    # @articles_with_images = articles - @articles_without_images
    # binding.break
  end

  def search
    # binding.break
    @articles = Article.search_by_title_source_and_readability_output(params[:query]).to_a.sort_by { |a| a.published_at }.reverse
    render :list
  end

  # GET /articles or /articles.json
  def index
    @articles = Article.all
  end

  def list
    @articles = Article.last(27)
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
  end

  # GET /articles/1 or /articles/1.json
  def show
  end

  # GET /articles/new
  def new
    @article = Article.new
  end

  # GET /articles/1/edit
  def edit
  end

  # POST /articles or /articles.json
  def create
    @article = Article.new(article_params)

    respond_to do |format|
      if @article.save
        format.html { redirect_to article_url(@article), notice: "Article was successfully created." }
        format.json { render :show, status: :created, location: @article }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @article.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /articles/1 or /articles/1.json
  def update
    respond_to do |format|
      if @article.update(article_params)
        format.html { redirect_to article_url(@article), notice: "Article was successfully updated." }
        format.json { render :show, status: :ok, location: @article }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @article.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /articles/1 or /articles/1.json
  def destroy
    @article.destroy!

    respond_to do |format|
      format.html { redirect_to articles_url, notice: "Article was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
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

    # Use callbacks to share common setup or constraints between actions.
    def set_article
      @article = Article.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def article_params
      params.require(:article).permit(:title, :image_url, :url, :preview_text)
    end
end
