class Comment < ApplicationRecord
  include Federails::DataEntity

  acts_as_federails_data(
    handles: "Note",
    actor_entity_method: :federails_actor,
    should_federate_method: :federate?,
    soft_deleted_method: :deleted?,
    soft_delete_date_method: :deleted_at
  )

  belongs_to :parent, polymorphic: true
  has_many :comments, dependent: :destroy, as: :parent

  validates :content, presence: true, allow_blank: false
  validates :parent_type, :parent_id, presence: true, allow_blank: false

  scope :top_level_comments, -> { where parent_id: nil }
  scope :active, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }

  on_federails_delete_requested -> { delete }

  def semi_delete!
    update!(
      deleted_at: Time.current,
      content: "deleted message" # Clear the content but keep the record
    )
  end

  def deleted?
    deleted_at.present?
  end

  def to_activitypub_object
    Federails::DataTransformer::Note.to_federation self,
      content: content
  end

  def self.handle_federated_object?(hash)
    # Only reply notes should be saved as Comment
    # Question, what other types of notes are there?
    hash["inReplyTo"].present?
  end

  # Create a comment from an incoming ActivityPub object
  def self.from_activitypub_object(hash)
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

  def soft_delete
    # update(deleted_at: Time.current)
  end
end
