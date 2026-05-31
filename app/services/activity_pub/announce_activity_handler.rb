class ActivityPub::AnnounceActivityHandler
  def self.handle_announce(activity_json)
    Rails.logger.info "=== Received Announce: #{activity_json['id']} from #{activity_json['actor']} ==="
    true
  end
end
