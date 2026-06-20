class LikesController < ApplicationController
  before_action :require_login
  before_action :set_article

  # POST /articles/:article_id/like
  def create
    # Don't double-like
    if @article.liked_by?(current_user)
      return respond_toggle(notice: "You already liked this article.")
    end

    # Ensure the user has a linked ap_actor (mirrors CommentsController#create)
    unless current_user.ap_actor
      current_user.link_to_federated_actor!
      current_user.reload

      unless current_user.ap_actor
        Rails.logger.error "Failed to link user to ap_actor"
        flash[:alert] = "Your account is not properly linked. Please log out and log back in to enable likes."
        return redirect_back fallback_location: frontpage_path
      end
    end

    begin
      if current_user.access_token.present? && current_user.domain.present?
        federate_article_if_needed

        MastodonApiClient.new(current_user).favourite_status(status_url: @article.federated_url)

        like = @article.likes.new(
          user_id: current_user.id,
          ap_actor: current_user.ap_actor,
          remote_actor_url: current_user.ap_actor.federated_url
        )
        like.skip_ap_callbacks = true
        like.save!
        Rails.logger.info "Favourited Article##{@article.id} on #{current_user.domain} and saved Like##{like.id}"
      else
        # No Mastodon credentials - store a local-only like
        @article.likes.create!(user_id: current_user.id)
        Rails.logger.info "Saved local-only Like for Article##{@article.id}"
      end

      respond_toggle(notice: "Article liked!")
    rescue MastodonApiClient::Error => e
      Rails.logger.error "Mastodon API error liking article: #{e.message}"
      respond_toggle(alert: "Failed to like on Mastodon: #{e.message}", status: :unprocessable_entity)
    rescue ActiveRecord::RecordInvalid => e
      Rails.logger.error "Failed to save like: #{e.message}"
      respond_toggle(alert: "Failed to like article: #{e.message}", status: :unprocessable_entity)
    end
  end

  # DELETE /articles/:article_id/like
  def destroy
    like = @article.like_for(current_user)
    return respond_toggle(notice: "You haven't liked this article.") unless like

    begin
      if @article.federated_url.present? && current_user.access_token.present? && current_user.domain.present?
        MastodonApiClient.new(current_user).unfavourite_status(status_url: @article.federated_url)
      end

      like.destroy!
      respond_toggle(notice: "Like removed.")
    rescue MastodonApiClient::Error => e
      Rails.logger.error "Mastodon API error unliking article: #{e.message}"
      respond_toggle(alert: "Failed to remove like on Mastodon: #{e.message}", status: :unprocessable_entity)
    end
  end

  private

  def set_article
    @article = Article.find(params[:article_id])
  end

  # If the article hasn't been federated yet, federate it now so the user's
  # Mastodon instance can resolve it (mirrors CommentsController#create).
  def federate_article_if_needed
    return if @article.federated_url.present?

    host = ENV["APP_HOST"] || Rails.application.routes.default_url_options[:host] || "localhost:3000"
    @article.update_column(:federated_url, "https://#{host}/ap/articles/#{@article.id}")
    ActivityPub::FedifyClient.create_article(@article.id)
    Rails.logger.info "Article##{@article.id} federation queued via Fedify before favouriting"
  end

  def respond_toggle(notice: nil, alert: nil, status: :ok)
    @article.reload
    respond_to do |format|
      format.turbo_stream do
        # replace_all targets the shared class so every like button on the page
        # (e.g. the one by "Listen" and the one above the discussion) updates.
        render turbo_stream: turbo_stream.replace_all(
          ".like-button-#{@article.id}",
          partial: "likes/like_button",
          locals: { article: @article }
        ), status: status
      end
      format.html do
        redirect_back fallback_location: frontpage_path, notice: notice, alert: alert
      end
    end
  end
end
