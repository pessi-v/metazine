# frozen_string_literal: true

class Article < ApplicationRecord
  include PgSearch::Model
  include Federails::DataEntity

  acts_as_federails_data(
    handles: "Note",
    with: :handle_incoming_fediverse_data,
    actor_entity_method: :federails_actor
  )

  belongs_to :source, counter_cache: true
  belongs_to :federails_actor, optional: false, class_name: "Federails::Actor", default: -> { Federails::InstanceActor.first.federails_actor }

  has_many :comments, dependent: :destroy, as: :parent

  validates :title, :source_name, presence: true
  validates :title, uniqueness: true
  validates :description, presence: true, allow_blank: false

  pg_search_scope :search_by_title_source_and_readability_output,
    against: %i[title source_name readability_output],
    using: {tsearch: {prefix: true}}, # tsearch = full text search
    ignoring: :accents

  scope :today, -> { where("DATE(published_at) = CURRENT_DATE") }
  scope :yesterday, -> { where("DATE(published_at) = CURRENT_DATE - 1") }
  scope :days_ago, ->(days) { where("DATE(published_at) = CURRENT_DATE - #{days}") }

  on_federails_delete_requested -> { Rails.logger.info "someone tried to Delete an Article via AP: #{self}" }

  def to_activitypub_object
    Rails.logger.info "Article#to_activitypub_object: #{self}"
    Federails::DataTransformer::Note.to_federation(
      self,
      name: title,
      content: description
    )
  end

  def self.handle_federated_object?(hash)
    # Replies are handled by Comment
    hash["inReplyTo"].blank?
  end

  # Creates or updates entity based on the ActivityPub activity
  #
  # @param activity_hash_or_id [Hash, String] Dereferenced activity hash or ID
  #
  # @return [self]
  def handle_incoming_fediverse_data(activity_hash_or_id)
    Rails.logger.info "Article#handle_incoming_fediverse_data: #{activity_hash_or_id}"
    activity = Fediverse::Request.dereference(activity_hash_or_id)
    object = Fediverse::Request.dereference(activity["object"])

    entity = Federails::Utils::Object.find_or_create!(object)

    if activity["type"] == "Update"
      entity.assign_attributes from_activitypub_object(object)

      # Use timestamps from attributes
      entity.save! touch: false
    end

    entity
  end

  # This would be to create an Article from an incoming ActivityPub object? TODO: remove
  def self.from_activitypub_object(hash)
    Rails.logger.info "Article#from_activitypub_object: #{hash}"

    Federails::Utils::Object.timestamp_attributes(hash)
      .merge(
        federated_url: hash["id"],
        title: hash["published"] || "A post",
        content: hash["content"]
      )
  end
end
