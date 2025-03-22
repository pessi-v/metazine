class Discussion < ApplicationRecord
  include Rails.application.routes.url_helpers
  include Federails::DataEntity

  # Here, 'Note' refers to the ActivityPub concept
  acts_as_federails_data(
    handles: 'Note',
    actor_entity_method: :user
  )

  belongs_to :article, optional: false
  belongs_to :user
  has_many :messages, dependent: :destroy
  validates :article_id, uniqueness: true
  validates :content, presence: true, allow_blank: false

  before_validation :set_content

  def add_message(message)
    Message.create(discussion: self, content: message)
  end

  def set_content
    self.content = reader_url(article)
  end

  def to_activitypub_object
    Federails::DataTransformer::Note.to_federation(
      self,
      content: content
    )
  end

  def self.from_activitypub_object(hash)
    # Gets the timestamps values with a helper
    Federails::Utils::Object
      .timestamp_attributes(hash)
      # Complete attributes
      .merge(
        federated_url: hash['id'],
        content: hash['content']
      )

    # attrs = Federails::Utils::Object
    #         .timestamp_attributes(hash)
    #         # Complete attributes
    #         .merge(
    #           federated_url: hash['id'],
    #           content: hash['content']
    #         )

    # Find the parent if message is an answer
    # parent = Federails::Utils::Object.find_or_create! hash['inReplyTo'] if hash['inReplyTo'].present?
    # attrs[:parent] = parent if parent

    # attrs
  end
end
