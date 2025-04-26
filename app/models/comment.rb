class Comment < ApplicationRecord
  include Federails::DataEntity

  acts_as_federails_data(
    handles: "Note",
    actor_entity_method: :federails_actor,
    should_federate_method: :federate?
  )

  validates :content, presence: true, allow_blank: false
  validates :parent_type, :parent_id, presence: true, allow_blank: false

  # belongs_to :post, optional: true
  # belongs_to :parent, optional: true, class_name: "Comment", inverse_of: :answers
  belongs_to :parent, polymorphic: true

  # has_many :answers, class_name: "Comment", foreign_key: :parent_id
  has_many :comments, dependent: :destroy, as: :parent

  scope :top_level_comments, -> { where parent_id: nil }

  on_federails_delete_requested -> { delete }

  def to_activitypub_object
    Rails.logger.info "Comment#to_activitypub_object"
    Federails::DataTransformer::Note.to_federation self,
      content: content
  end

  def self.handle_federated_object?(hash)
    Rails.logger.info "Comment::handle_federated_object?"
    # Only reply notes should be saved as Comment
    # Question, what other types of notes are there?
    hash["inReplyTo"].present?
  end

  def self.from_activitypub_object(hash)
    Rails.logger.info "Comment::from_activitypub_object"
    raise "No parent defined in object" if hash["inReplyTo"].blank?

    attrs = Federails::Utils::Object.timestamp_attributes(hash)
      .merge(
        federated_url: hash["id"],
        content: hash["content"]
      )

    parent_type = Federails::Utils::Object.find_or_create! hash["inReplyTo"]
    Rails.logger.info "Comment::from_activitypub_object: parent_type: #{parent_type}, hash: #{hash}"
    attrs[:parent_type] = parent_type

    attrs
  end

  def federate?
    true
  end
end
