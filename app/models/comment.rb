require 'federails/data_transformer/note'

class Comment < ApplicationRecord
  include Federails::DataEntity

  acts_as_federails_data(
    handles: "Note",
    actor_entity_method: :federails_actor,
    should_federate_method: :federate?,
    route_path_segment: :comments,
    url_param: :id
  )

  belongs_to :parent, polymorphic: true
  belongs_to :user, optional: true
  has_many :comments, dependent: :destroy, as: :parent

  validates :content, presence: true, allow_blank: false
  validates :parent_type, :parent_id, presence: true, allow_blank: false
  validates :federails_actor, presence: true

  # Virtual attribute to skip Federails callbacks
  # Used when posting directly to Mastodon outbox
  attr_accessor :skip_federails_callbacks

  # After creating a federated comment, try to link it to an existing user
  after_create :link_to_user_if_exists

  # Federate parent Article on first comment
  after_create :federate_parent_article_on_first_comment

  # Prevent editing deleted comments
  validate :cannot_edit_deleted_comment, on: :update

  def cannot_edit_deleted_comment
    if deleted_at_was.present? && !deleted_at_changed?
      errors.add(:base, "Cannot edit a deleted comment")
    end
  end

  scope :top_level_comments, -> { where parent_id: nil }
  scope :local_comments, -> { where(federated_url: nil) }
  scope :federated_comments, -> { where.not(federated_url: nil) }
  scope :active, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }

  # When receiving a Delete activity from the fediverse, soft delete the comment
  on_federails_delete_requested -> { update_columns(deleted_at: Time.current, content: "[deleted]", user_id: nil) }

  # Override destroy to soft delete instead of hard delete
  # Use prepend: true to run before Federails callbacks
  before_destroy :manually_federate_delete, prepend: true
  before_destroy :soft_delete_instead_of_destroy

  def manually_federate_delete
    # Only proceed if not already deleted and should federate
    return if deleted?
    return unless federate?

    begin
      # Create and enqueue the Delete activity in a separate transaction
      # This ensures it commits even if the destroy is aborted
      Comment.transaction(requires_new: true) do
        activity = Federails::Activity.create!(
          actor: federails_actor,
          entity: self,
          action: 'Delete'
        )

        Federails::NotifyInboxJob.perform_later(activity)
        Rails.logger.info "Created Delete activity for Comment##{id}, Activity##{activity.id}"
      end
    rescue => e
      Rails.logger.error "Error creating Delete activity for Comment##{id}: #{e.message}"
    end
  end

  def soft_delete_instead_of_destroy
    # Only soft delete if not already deleted
    unless deleted?
      update_columns(
        deleted_at: Time.current,
        content: "[deleted]",
        user_id: nil
      )
      Rails.logger.info "Soft deleted Comment##{id}"
    end

    # Halt the destroy chain to prevent actual database deletion
    throw(:abort)
  end

  def to_activitypub_object
    # Get the parent's federated URL for inReplyTo field
    parent_url = if parent.present?
      if parent.is_a?(Article) || parent.is_a?(Comment)
        parent.federated_url
      end
    end

    Rails.logger.info "=== Building ActivityPub object for Comment##{id} ==="
    Rails.logger.info "  Parent: #{parent.class.name}##{parent.id}" if parent
    Rails.logger.info "  Parent URL (inReplyTo): #{parent_url}"

    # Build recipient list for proper ActivityPub addressing
    to_addresses = []
    cc_addresses = []

    # Add parent author to "to" (direct recipients)
    # This is critical for replies to federated comments from Mastodon
    if parent.present? && parent.respond_to?(:federails_actor)
      parent_actor = parent.federails_actor
      if parent_actor&.distant?
        to_addresses << parent_actor.federated_url
        Rails.logger.info "  Added parent author to 'to': #{parent_actor.username}@#{parent_actor.server}"
      end
    end

    # Add all thread participants to "cc" (carbon copy)
    article = nil
    if parent.is_a?(Article)
      article = parent
    elsif parent.is_a?(Comment)
      # Walk up to find the root article with loop protection
      current = parent
      max_depth = 50
      depth = 0
      while current.is_a?(Comment) && current.parent.present? && depth < max_depth
        current = current.parent
        depth += 1
      end
      article = current if current.is_a?(Article)
    end

    if article
      # IMPORTANT: Add the article's author (InstanceActor) to cc
      # This ensures replies to comments are sent to our instance's inbox
      if article.respond_to?(:federails_actor) && article.federails_actor
        cc_addresses << article.federails_actor.federated_url
      end

      # Get all unique remote actors who commented on this article
      article.comments.includes(:federails_actor).find_each do |comment|
        if comment.federails_actor&.distant? && comment.id != id
          cc_addresses << comment.federails_actor.federated_url
        end
      end
    end

    # Add public addressing if needed (makes it visible to everyone)
    to_addresses << 'https://www.w3.org/ns/activitystreams#Public'

    # Add followers to cc
    if federails_actor&.local? && federails_actor.followers_url
      cc_addresses << federails_actor.followers_url
    end

    # IMPORTANT: Add InstanceActor's followers_url to cc
    # This ensures all comments are visible to everyone following the instance
    instance_actor = InstanceActor.first&.federails_actor
    if instance_actor&.followers_url
      cc_addresses << instance_actor.followers_url
      Rails.logger.info "  Added InstanceActor followers_url to CC"
    end

    Rails.logger.info "  To addresses: #{to_addresses.uniq.compact.join(', ')}"
    Rails.logger.info "  CC addresses: #{cc_addresses.uniq.compact.join(', ')}"

    Federails::DataTransformer::Note.to_federation self,
      content: content,
      custom: {
        'inReplyTo' => parent_url,
        'to' => to_addresses.uniq.compact,
        'cc' => cc_addresses.uniq.compact
      }
  end

  def self.handle_federated_object?(hash)
    # Only reply notes should be saved as Comment
    # Question, what other types of notes are there?
    hash["inReplyTo"].present?
  end

  # Create a comment from an incoming ActivityPub object
  def self.from_activitypub_object(hash)
    # example_hash = {
    #   "id" => "https://remote.social/users/bob/statuses/114411967872142984",
    #   "type" => "Note",
    #   "inReplyTo" => "https://metazine.com/federation/published/articles/4567",
    #   "published" => "2025-04-27T21:08:03Z",
    #   "url" => "https://remote.social/@bob/114411967872142984",
    #   "attributedTo" => "https://remote.social/users/bob",
    #   "to" => "as:Public",
    #   "cc" => "https://remote.social/users/bob/followers",
    #   "sensitive" => false,
    #   "atomUri" => "https://remote.social/users/bob/statuses/114411967872142984",
    #   "inReplyToAtomUri" => "https://metazine.com/federation/published/articles/4567",
    #   "conversation" => "tag:remote.social,2025-04-27:objectId=117405214:objectType=Conversation",
    #   "content" => "<p>HELLO WORLD</p>",
    #   "contentMap" => {"de" => "<p>HELLO WORLD</p>"},
    #   "attachment" => [],
    #   "tag" => [],
    #   "replies" =>
    #     {"id" => "https://remote.social/users/bob/statuses/114411967872142984/replies",
    #       "type" => "Collection",
    #       "first" =>
    #         {"type" => "CollectionPage",
    #           "next" => "https://remote.social/users/bob/statuses/114411967872142984/replies?only_other_accounts=true&page=true",
    #           "partOf" => "https://remote.social/users/bob/statuses/114411967872142984/replies",
    #           "items" => []
    #         }
    #     }
    #   }

    raise "No parent defined in object" if hash["inReplyTo"].blank?

    attrs = Federails::Utils::Object.timestamp_attributes(hash)
      .merge(
        federated_url: hash["id"],
        content: hash["content"]
      )

    parent = Federails::Utils::Object.find_or_create! hash["inReplyTo"]
    attrs[:parent_type] = parent.class.name
    attrs[:parent_id] = parent.id

    attrs
  end

  def federate?
    # Don't federate if we're posting to Mastodon outbox directly
    # or if the comment already has a federated_url from Mastodon
    return false if skip_federails_callbacks

    # Use read_attribute to avoid any potential infinite loops from Federails
    url = read_attribute(:federated_url)
    return false if url.present? && url.include?('mastodon')

    true
  end

  # Returns true if this is a local comment (created via newfutu.re, not via ActivityPub)
  def local?
    federated_url.blank?
  end

  # Returns true if this is a federated comment (from ActivityPub)
  def federated?
    federated_url.present?
  end

  # Get the display name for the comment author
  def author_name
    if local? && user.present?
      user.name
    elsif federails_actor
      federails_actor.name || "Anonymous"
    else
      "Anonymous"
    end
  end

  # Get the username for the comment author
  def author_username
    if local? && user.present?
      user.full_username
    elsif federails_actor
      federails_actor.username || "unknown"
    else
      "unknown"
    end
  end

  # Soft delete the comment (kept for backwards compatibility)
  # NOTE: For federation to work properly, use .destroy instead
  # which triggers the before_destroy callback
  def soft_delete!
    update_columns(
      deleted_at: Time.current,
      content: "[deleted]",
      user_id: nil
    )
  end

  # Check if comment is deleted
  def deleted?
    deleted_at.present?
  end

  # Check if a given user owns this comment (either local or federated)
  def owned_by?(user)
    return false unless user

    # Direct ownership via user_id
    return true if user_id == user.id

    # Federated ownership: same federails_actor
    return true if federails_actor && user.federails_actor &&
                   federails_actor.id == user.federails_actor.id

    false
  end

  private

  # Links this comment to a user if the federails_actor is associated with a user
  def link_to_user_if_exists
    return if user_id.present? # Already linked
    return unless federails_actor

    # Check if this actor is associated with a logged-in user
    if federails_actor.entity_type == 'User' && federails_actor.entity_id
      update_column(:user_id, federails_actor.entity_id)
      Rails.logger.info "Linked Comment##{id} to User##{federails_actor.entity_id}"
    end
  end

  # When this is the first comment on an Article, federate the Article
  def federate_parent_article_on_first_comment
    return unless parent.is_a?(Article)
    return if parent.federated_url.present? # Already federated

    # Check if this is the first comment (should be, since we just created it)
    comment_count = parent.comments.count
    if comment_count == 1
      Rails.logger.info "=== First comment on Article##{parent.id}, triggering Article federation ==="

      # Generate the federated_url for the Article
      # This must be set BEFORE creating the Activity so the published endpoint allows access
      host = Rails.application.routes.default_url_options[:host] || ENV["APP_HOST"] || "localhost:3000"
      article_url = "https://#{host}/federation/published/articles/#{parent.id}"

      # Set the federated_url on the Article
      parent.update_column(:federated_url, article_url)
      Rails.logger.info "  Set Article federated_url: #{article_url}"

      # Manually trigger federation of the Article
      # Create a Federails Activity for the Article
      activity = Federails::Activity.create!(
        actor: parent.federails_actor,
        entity: parent,
        action: 'Create'
      )

      # Enqueue the federation job
      Federails::NotifyInboxJob.perform_later(activity)

      Rails.logger.info "  Article federation Activity##{activity.id} created and enqueued"
    end
  rescue => e
    Rails.logger.error "=== Error federating parent Article ==="
    Rails.logger.error "  Error: #{e.class}: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    # Don't raise - allow comment creation to proceed even if Article federation fails
  end
end
