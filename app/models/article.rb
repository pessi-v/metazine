# frozen_string_literal: true

require 'federails/data_transformer/note'

class Article < ApplicationRecord
  include PgSearch::Model
  include Federails::DataEntity

  include ActionView::Helpers::TagHelper
  include ActionView::Context
  include Rails.application.routes.url_helpers

  acts_as_federails_data(
    handles: "Note",
    with: :handle_incoming_fediverse_data,
    actor_entity_method: :federails_actor,
    should_federate_method: :should_federate?,
    route_path_segment: :articles,
    url_param: :id
  )

  belongs_to :source, counter_cache: true
  belongs_to :federails_actor, optional: false, class_name: "Federails::Actor"

  has_many :comments, dependent: :delete_all, as: :parent

  validates :title, :source_name, presence: true
  validates :title, uniqueness: true
  validates :description, presence: true, allow_blank: false

  # Extract searchable content from readability_output_jsonb
  before_save :extract_searchable_content

  # Publish to Bluesky after creation
  # DISABLED: ATProto/Bluesky integration temporarily disabled
  # after_create_commit :publish_to_bluesky, if: -> { Rails.env.production? && federated_url.blank? }

  pg_search_scope :search_by_title_source_and_readability_output,
    against: %i[title source_name searchable_content],
    using: {tsearch: {prefix: true}}, # tsearch = full text search
    ignoring: :accents

  scope :today, -> { where("DATE(published_at) = CURRENT_DATE") }
  scope :yesterday, -> { where("DATE(published_at) = CURRENT_DATE - 1") }
  scope :days_ago, ->(days) { where("DATE(published_at) = CURRENT_DATE - #{days}") }

  on_federails_delete_requested -> { Rails.logger.info "someone tried to Delete an Article via AP: #{self}" }

  def should_federate?
    # Only federate if already has a federated_url (has been explicitly federated)
    # This prevents auto-federation on create/update
    # Articles are only federated when they receive their first comment
    # Use read_attribute to avoid infinite recursion with Federails
    read_attribute(:federated_url).present?
  end

  def to_activitypub_object
    Federails::DataTransformer::Note.to_federation(
      self,
      name: title,
      content: "<a href=\"#{reader_url(self)}\">#{reader_url(self)}</a>"
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
    Federails::Utils::Object.timestamp_attributes(hash)
      .merge(
        federated_url: hash["id"],
        title: hash["published"] || "A post",
        content: hash["content"]
      )
  end

  private

  # Extract plain text content from readability_output_jsonb for search indexing
  def extract_searchable_content
    return unless readability_output_jsonb.present? && readability_output_jsonb["content"].present?

    # Skip if searchable_content hasn't changed
    return if !readability_output_jsonb_changed? && searchable_content.present?

    html_content = readability_output_jsonb["content"]

    # Parse HTML and extract text
    doc = Nokogiri::HTML(html_content)

    # Remove script and style tags
    doc.css('script, style').remove

    # Extract text and clean it up
    text = doc.text
      .gsub(/\s+/, ' ')  # Collapse multiple spaces
      .strip

    # Truncate to reasonable length for search (first 10000 chars)
    # This prevents the column from getting too large while keeping enough for search
    self.searchable_content = text[0...10000]
  end

  # Publish article to Bluesky via our PDS
  # DISABLED: ATProto/Bluesky integration temporarily disabled
  # def publish_to_bluesky
  #   BlueskyPublisher.new.publish_article(self)
  # rescue => e
  #   Rails.logger.error "Failed to publish article to Bluesky: #{e.message}"
  #   Rails.logger.error e.backtrace.first(5).join("\n")
  #   # Don't raise - we don't want to block article creation if Bluesky publish fails
  # end
end
