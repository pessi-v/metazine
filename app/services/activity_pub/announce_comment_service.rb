class ActivityPub::AnnounceCommentService
  def self.call(comment)
    new(comment).announce
  end

  def initialize(comment)
    @comment = comment
    @instance_actor = InstanceActor.first&.federails_actor
  end

  def announce
    Rails.logger.info "=== AnnounceCommentService called for Comment##{comment.id} ==="

    unless should_announce?
      Rails.logger.info "  Skipping announce: should_announce? returned false"
      return
    end

    unless instance_actor
      Rails.logger.info "  Skipping announce: no instance_actor found"
      return
    end

    if already_announced?
      Rails.logger.info "  Skipping announce: already announced"
      return
    end

    activity = Federails::Activity.create!(
      actor: instance_actor,
      entity: comment,
      action: 'Announce'
    )

    remote_url = comment.read_attribute(:federated_url)
    Rails.logger.info "=== Created Announce activity for Comment##{comment.id} ==="
    Rails.logger.info "  Remote URL: #{remote_url}"
    Rails.logger.info "  InstanceActor followers: #{instance_actor.followers.count}"

    Federails::NotifyInboxJob.perform_later(activity)
  end

  private

  attr_reader :comment, :instance_actor

  def should_announce?
    Rails.logger.info "  Checking should_announce?"

    # Access the raw federated_url column (federails overrides the method)
    remote_url = comment.read_attribute(:federated_url)
    Rails.logger.info "    Remote federated_url: #{remote_url}"

    # Only announce federated comments (not local ones)
    unless remote_url.present?
      Rails.logger.info "    No remote federated_url present"
      return false
    end

    unless remote_url.include?("mastodon") || remote_url.match?(/https?:\/\/[^\/]+\/@/)
      Rails.logger.info "    federated_url doesn't match mastodon pattern: #{remote_url}"
      return false
    end

    # Only announce if we have followers
    unless instance_actor&.followers&.any?
      Rails.logger.info "    InstanceActor has no followers"
      return false
    end

    Rails.logger.info "    InstanceActor has #{instance_actor.followers.count} followers"

    # Only announce comments on OUR federated content
    article = find_root_article
    Rails.logger.info "    Found root article: #{article&.class&.name}##{article&.id}"

    unless article&.federated_url.present?
      Rails.logger.info "    Article has no federated_url"
      return false
    end

    Rails.logger.info "    Article federated_url: #{article.federated_url}"

    # Verify article federated_url is from our instance
    our_host = Rails.application.config.action_mailer.default_url_options[:host]
    Rails.logger.info "    Our host: #{our_host}"

    result = article.federated_url.include?(our_host)
    Rails.logger.info "    Host match result: #{result}"

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

  def already_announced?
    Federails::Activity.exists?(
      actor: instance_actor,
      entity: comment,
      action: 'Announce'
    )
  end
end
