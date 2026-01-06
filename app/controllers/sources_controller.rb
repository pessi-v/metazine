# frozen_string_literal: true

class SourcesController < ApplicationController
  before_action :set_source, only: %i[show edit update destroy]
  http_basic_authenticate_with name: "admin", password: "metazine", only: %i[new edit create destroy update fetch_feed fetch_feeds]

  # GET /sources or /sources.json
  def index
    @sources = Source.active.order(:name).select(:id, :name, :url, :articles_count)
    # Group sources by first letter and sort alphabetically
    @sources_in_array = @sources.group_by { |source| source.name[0].upcase }
      .sort_by { |letter, _| letter }
      .map { |letter, sources| [letter, sources] }
  end

  def sources_admin
    @sources = Source.all.order(articles_count: :desc)
    @article_counts_by_day = [
      Article.today.count,
      Article.yesterday.count,
      Article.days_ago(2).count,
      Article.days_ago(3).count,
      Article.days_ago(4).count,
      Article.days_ago(5).count,
      Article.days_ago(6).count,
      Article.days_ago(7).count
    ]
  end

  # GET /sources/1 or /sources/1.json
  def show
  end

  # GET /sources/new
  def new
    @source = Source.new
  end

  # GET /sources/1/edit
  def edit
  end

  def fetch_feeds
    FeedFetcherJob.perform_later

    respond_to do |format|
      format.html { redirect_to sources_path, notice: "Feed refresh started in background" }
      format.turbo_stream do
        render turbo_stream: turbo_stream.update("reload_feeds_button",
          partial: "sources/reload_feeds_updating")
      end
    end
  end

  def fetch_feed
    source = Source.find(params[:source_id])
    source.consume_feed
    # Sources::FeedFetcher.new.consume(source)
    source.reload

    respond_to do |format|
      format.html { redirect_to sources_path }
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(source, partial: "sources/source", locals: {source: source})
      end
    end
  end

  def cancel_new
    render turbo_stream: turbo_stream.update("new_source", "")
  end

  # POST /sources or /sources.json
  def create
    @source = Source.new(source_params)

    respond_to do |format|
      if @source.save
        format.html { redirect_to source_url(@source), notice: "Source was successfully created." }
        format.json { render :show, status: :created, location: @source }
        format.turbo_stream
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @source.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /sources/1 or /sources/1.json
  def update
    respond_to do |format|
      if @source.update(source_params)
        format.html { redirect_to source_url(@source), notice: "Source was successfully updated." }
        format.json { render :show, status: :ok, location: @source }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @source.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /sources/1 or /sources/1.json
  def destroy
    @source.destroy!

    respond_to do |format|
      format.html { redirect_to sources_url, notice: "Source was successfully destroyed." }
      format.json { head :no_content }
      format.turbo_stream
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_source
    @source = Source.find(params[:id])
  end

  # Only allow a list of trusted parameters through.
  def source_params
    params.require(:source).permit(:name, :url, :last_modified, :etag, :active, :show_images, :allow_video,
      :allow_audio, :last_error_status)
  end
end
