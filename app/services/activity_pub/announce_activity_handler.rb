class ActivityPub::AnnounceActivityHandler
  def self.handle_announce(activity_hash_or_id)
    activity = Fediverse::Request.dereference(activity_hash_or_id)

    Rails.logger.info "=== Received Announce activity ==="
    Rails.logger.info "  Announce ID: #{activity['id']}"
    Rails.logger.info "  Actor: #{activity['actor']}"
    Rails.logger.info "  Object: #{activity['object']}"

    # For now, just log it
    # Future: could store for analytics, display as "boosted by", etc.

    true
  rescue => e
    Rails.logger.error "=== Error handling Announce activity ==="
    Rails.logger.error "  Error: #{e.class}: #{e.message}"
    false
  end
end
