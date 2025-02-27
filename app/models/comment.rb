class Comment < ApplicationRecord
  # include Federails::DataEntity
  # acts_as_federails_data(
  #   handles: 'Note',
  #   actor_entity_method: :creator
  # )

  belongs_to :discussion
  # belongs_to :creator, class_name: 'Federails::Actor'  # This replaces belongs_to :user
  # belongs_to :parent, class_name: 'Comment', optional: true
  # has_many :replies, class_name: 'Comment', foreign_key: :parent_id

  # validates :content, presence: true

  def to_activitypub_object
    Federails::DataTransformer::Note.to_federation(
      self,
      content: content,
      attributedTo: creator.federated_url,
      inReplyTo: parent&.federated_url || discussion.federated_url,
      context: discussion.federated_url
    )
  end

  # def self.from_activitypub_object(hash)
  #   attrs = Federails::Utils::Object.timestamp_attributes(hash)
  #     .merge(
  #       federated_url: hash['id'],
  #       content: hash['content']
  #     )

  #   # Find or create the actor who created this comment
  #   if hash['attributedTo'].present?
  #     creator = Federails::Actor.find_or_create_by_federation_url(hash['attributedTo'])
  #     attrs[:creator_id] = creator.id
  #   end

  #   # Find the parent (either discussion or comment)
  #   if hash['inReplyTo'].present?
  #     parent = Discussion.find_by(federated_url: hash['inReplyTo']) || 
  #              Comment.find_by(federated_url: hash['inReplyTo'])
      
  #     if parent.is_a?(Discussion)
  #       attrs[:discussion_id] = parent.id
  #     else
  #       attrs[:parent_id] = parent.id
  #       attrs[:discussion_id] = parent.discussion_id
  #     end
  #   end

  #   attrs
  # end
end
