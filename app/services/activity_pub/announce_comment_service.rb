class ActivityPub::AnnounceCommentService
  def self.call(comment)
    new(comment).announce
  end

  def initialize(comment)
    @comment = comment
    @instance_actor = InstanceActor.first&.federails_actor
  end

  def announce
    return unless should_announce?
    return unless instance_actor
    return if already_announced?

    activity = Federails::Activity.create!(
      actor: instance_actor,
      entity: comment,
      action: 'Announce'
    )

    Rails.logger.info "=== Created Announce activity for Comment##{comment.id} ==="
    Rails.logger.info "  Remote URL: #{comment.federated_url}"
    Rails.logger.info "  InstanceActor followers: #{instance_actor.followers.count}"

    Federails::NotifyInboxJob.perform_later(activity)
  end

  private

  attr_reader :comment, :instance_actor

  def should_announce?
    # Only announce federated comments (not local ones)
    return false unless comment.federated_url.present?
    return false unless comment.federated_url.include?("mastodon") ||
                        comment.federated_url.match?(/https?:\/\/[^\/]+\/@/)

    # Only announce if we have followers
    return false unless instance_actor&.followers&.any?

    # Only announce comments on OUR federated content
    article = find_root_article
    return false unless article&.federated_url.present?

    # Verify article federated_url is from our instance
    our_host = Rails.application.config.action_mailer.default_url_options[:host]
    article.federated_url.include?(our_host)
  end

  def find_root_article
    current = comment
    while current.parent
      return current.parent if current.parent.is_a?(Article)
      current = current.parent
    end
    nil
  end

  def already_announced?
    Federails::Activity.exists?(
      actor: instance_actor,
      entity: comment,
      action: 'Announce'
    )
  end
end
