class Message < ApplicationRecord
  include Federails::DataEntity
  acts_as_federails_data handles: 'Note',
                         actor_entity_method: :user

  validates :content, presence: true, allow_blank: false

  belongs_to :user, optional: true # Change here 
  belongs_to :parent, optional: true, class_name: 'Comment', inverse_of: :answers
  has_many :answers, class_name: 'Comment', foreign_key: :parent_id  
   
  # Transforms the instance to a valid ActivityPub object   
  # @return [Hash]
  def to_activitypub_object
    Federails::DataTransformer::Note.to_federation self,
                                                   content:   content,
                                                   inReplyTo: parent?.federated_url
  end

  # Takes a Note hash and returns the attributes for a valid Message
  #
  # @param hash [Hash] 
  #
  # @return [Hash] Valid Hash 
  def self.from_activitypub_object(hash)
    # Gets the timestamps values with a helper
    attrs = Federails::Utils::Object.timestamp_attributes(hash)
                                    # Complete attributes
                                    .merge federated_url: hash['id'],
                                           content:       hash['content']

    # Find the parent if message is an answer
    parent = Federails::Utils::Object.find_or_create! hash['inReplyTo'] if hash['inReplyTo'].present? 
    attrs[:parent] = parent if parent

    attrs
  end

end
