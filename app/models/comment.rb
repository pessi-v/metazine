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

  # Create a comment from an incoming ActivityPub object
  def self.from_activitypub_object(hash)
    Rails.logger.info "Comment::from_activitypub_object"
    Rails.logger.info "Comment::from_activitypub_object: hash: #{hash}"

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
    Rails.logger.info "Comment::from_activitypub_object: parent: #{parent.inscpect}"
    attrs[:parent_type] = parent.class.name
    attrs[:parent_id] = parent.id

    attrs
  end

  def federate?
    true
  end
end
