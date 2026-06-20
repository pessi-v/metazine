class ActivityPub::LikeActivityHandler
  # Handles an incoming Like activity (a remote actor favourited one of our articles).
  def self.handle_like(activity_json)
    liked_url = extract_object_url(activity_json)
    actor_url = extract_actor_url(activity_json)
    like_id   = activity_json["id"]

    Rails.logger.info "=== Received Like activity ==="
    Rails.logger.info "  object: #{liked_url}"
    Rails.logger.info "  actor: #{actor_url}"

    return unless liked_url.present? && actor_url.present?

    article = Article.find_by(federated_url: liked_url)
    unless article
      Rails.logger.warn "  No article found for liked object: #{liked_url}"
      return
    end

    # Dedupe against a like we already recorded for this actor (e.g. the user's
    # own favourite created via the Mastodon API).
    existing = article.likes.find_by(remote_actor_url: actor_url)
    if existing
      existing.update_column(:federated_url, like_id) if existing.federated_url.blank? && like_id.present?
      Rails.logger.info "  Like already recorded for actor; skipping (Like##{existing.id})"
      return
    end

    like = article.likes.new(
      remote_actor_url: actor_url,
      federated_url: like_id
    )
    like.skip_ap_callbacks = true

    if like.save
      Rails.logger.info "  Created Like##{like.id}"
    else
      Rails.logger.error "  Failed to create Like: #{like.errors.full_messages.join(', ')}"
    end
  rescue => e
    Rails.logger.error "=== Error handling Like: #{e.class}: #{e.message} ==="
    Rails.logger.error e.backtrace.first(5).join("\n")
    raise
  end

  # Handles an incoming Undo(Like) activity (a remote actor removed their favourite).
  # The sidecar forwards the *inner* Like's JSON-LD as `raw`, so this parses the
  # same shape as handle_like: id => Like activity URI, object => liked URL.
  def self.handle_undo_like(activity_json)
    liked_url = extract_object_url(activity_json)
    actor_url = extract_actor_url(activity_json)
    like_id   = activity_json["id"]

    Rails.logger.info "=== Received Undo(Like) activity ==="
    Rails.logger.info "  object: #{liked_url}"
    Rails.logger.info "  actor: #{actor_url}"

    like = Like.find_by(federated_url: like_id) if like_id.present?

    if like.nil? && liked_url.present? && actor_url.present?
      article = Article.find_by(federated_url: liked_url)
      like = article&.likes&.find_by(remote_actor_url: actor_url)
    end

    unless like
      Rails.logger.warn "  No matching Like found to undo"
      return
    end

    like.destroy
    Rails.logger.info "  Removed Like##{like.id}"
  rescue => e
    Rails.logger.error "=== Error handling Undo(Like): #{e.class}: #{e.message} ==="
    Rails.logger.error e.backtrace.first(5).join("\n")
    raise
  end

  def self.extract_actor_url(activity_json)
    actor = activity_json["actor"]
    actor.is_a?(Hash) ? actor["id"] : actor
  end

  # For a Like, object is the liked URL. For Undo(Like), the forwarded payload
  # carries the inner Like's object (the liked URL) directly.
  def self.extract_object_url(activity_json)
    object = activity_json["object"]
    return object if object.is_a?(String)
    object["id"] if object.is_a?(Hash)
  end
end
