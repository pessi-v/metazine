class ActivityPub::AnnounceCommentService
  def self.call(comment)
    new(comment).forward_comment
  end

  def initialize(comment)
    @comment = comment
  end

  def forward_comment
    Rails.logger.info "=== AnnounceCommentService called for Comment##{comment.id} ==="

    unless should_forward?
      Rails.logger.info "  Skipping announce: should_forward? returned false"
      return
    end

    if already_forwarded?
      Rails.logger.info "  Skipping announce: already announced"
      return
    end

    remote_url = comment.read_attribute(:federated_url)
    Rails.logger.info "=== Announcing Comment##{comment.id} via Fedify ==="
    Rails.logger.info "  Comment URL: #{remote_url}"

    ActivityPub::FedifyClient.announce_comment(comment_id: comment.id, object_url: remote_url)
  end

  private

  attr_reader :comment

  def should_forward?
    Rails.logger.info "  Checking should_forward?"

    remote_url = comment.read_attribute(:federated_url)
    Rails.logger.info "    Remote federated_url: #{remote_url}"

    unless remote_url.present?
      Rails.logger.info "    No remote federated_url present"
      return false
    end

    unless remote_url.include?("mastodon") || remote_url.match?(/https?:\/\/[^\/]+\/@/)
      Rails.logger.info "    federated_url doesn't match mastodon pattern: #{remote_url}"
      return false
    end

    # Only forward if we have followers in the new ap_follows table
    unless ApFollow.accepted.any?
      Rails.logger.info "    InstanceActor has no followers"
      return false
    end

    # Only forward comments on OUR federated content
    article = find_root_article
    Rails.logger.info "    Found root article: #{article&.class&.name}##{article&.id}"

    unless article&.federated_url.present?
      Rails.logger.info "    Article has no federated_url"
      return false
    end

    Rails.logger.info "    Article federated_url: #{article.federated_url}"

    app_host = ENV["APP_HOST"].presence || Rails.application.routes.default_url_options[:host].to_s
    result = app_host.present? && article.federated_url.include?(app_host)

    Rails.logger.info "    Is from our instance: #{result}"
    result
  end

  def find_root_article
    current = comment
    while current.parent
      return current.parent if current.parent.is_a?(Article)
      current = current.parent
    end
    nil
  end

  def already_forwarded?
    # Check in both old Federails activities and new ap_follows-based tracking
    # For now, use Federails as the source of truth during the transition
    instance_actor = InstanceActor.first&.federails_actor
    return false unless instance_actor

    Federails::Activity.exists?(actor: instance_actor, entity: comment, action: "Announce")
  end
end
