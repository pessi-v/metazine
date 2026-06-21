class Like < ApplicationRecord
  belongs_to :article, counter_cache: true
  belongs_to :user, optional: true
  belongs_to :ap_actor, optional: true, class_name: "ApActor"

  attr_accessor :skip_ap_callbacks

  after_create :link_to_user_if_exists
  after_create :federate_article_on_first_like

  scope :local, -> { where(federated_url: nil) }
  scope :federated, -> { where.not(federated_url: nil) }

  def local?
    federated_url.blank?
  end

  def federated?
    federated_url.present?
  end

  def author_name
    return user.name if user.present?
    return ap_actor.name if ap_actor&.name.present?
    remote_actor_username || "Anonymous"
  end

  private

  def remote_actor_username
    return nil unless remote_actor_url.present?
    uri = URI.parse(remote_actor_url)
    uri.path.split("/").reject(&:empty?).last
  rescue URI::InvalidURIError
    nil
  end

  # Mirrors Comment#link_to_user_if_exists: resolve the remote actor to a local User
  # so likes made via ActivityPub get attributed to the matching account.
  def link_to_user_if_exists
    return if user_id.present?

    if ap_actor&.entity_type == "User" && ap_actor&.entity_id
      update_column(:user_id, ap_actor.entity_id)
      return
    end

    if remote_actor_url.present?
      user = user_for_actor_url(remote_actor_url)
      update_column(:user_id, user.id) if user
    end
  end

  def user_for_actor_url(url)
    uri = URI.parse(url)
    parts = uri.path.split("/").reject(&:empty?)
    username = parts.last
    domain = uri.host
    User.find_by(username: username, domain: domain)
  rescue URI::InvalidURIError
    nil
  end

  # Mirrors Comment#federate_parent_article_on_first_comment: when a like is the
  # first action on an Article (nothing has federated it yet), federate it so the
  # activity has a real ActivityPub object to attach to.
  def federate_article_on_first_like
    article.federate!
  rescue => e
    Rails.logger.error "=== Error federating Article on first like: #{e.class}: #{e.message} ==="
    Rails.logger.error e.backtrace.first(5).join("\n")
  end
end
