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

  # After creating a federated comment, try to link it to an existing user
  after_create :link_to_user_if_exists

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
  # This allows federails to send the Delete activity before we soft delete
  before_destroy :soft_delete_instead_of_destroy

  def soft_delete_instead_of_destroy
    # Only soft delete if not already deleted
    unless deleted?
      update_columns(
        deleted_at: Time.current,
        content: "[deleted]",
        user_id: nil
      )
    end
    # Return false to halt the destroy chain and prevent actual deletion
    throw(:abort)
  end

  def to_activitypub_object
    # Get the parent's federated URL for inReplyTo field
    parent_url = if parent.is_a?(Article)
      parent.federated_url
    elsif parent.is_a?(Comment)
      parent.federated_url
    end

    # Build recipient list for proper ActivityPub addressing
    to_addresses = []
    cc_addresses = []

    # Add parent author to "to" (direct recipients)
    if parent.respond_to?(:federails_actor) && parent.federails_actor&.distant?
      to_addresses << parent.federails_actor.federated_url
    end

    # Add all thread participants to "cc" (carbon copy)
    if parent.is_a?(Article)
      article = parent
    elsif parent.is_a?(Comment)
      # Walk up to find the root article
      article = parent
      article = article.parent while article.is_a?(Comment)
    end

    if article
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
    if local?
      user.name
    else
      federails_actor&.name || "Anonymous"
    end
  end

  # Get the username for the comment author
  def author_username
    if local?
      user.full_username
    else
      federails_actor&.username || "unknown"
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
end
