# frozen_string_literal: true

class Discussion < ApplicationRecord
  include Federails::DataEntity
  include Rails.application.routes.url_helpers

  acts_as_federails_data(handles: 'Note', actor_entity_method: :user)
  belongs_to :article, optional: false
  belongs_to :user
  has_many :comments, dependent: :destroy
  validates :article_id, uniqueness: true
  validates :content, presence: true, allow_blank: false

  # before_validation :set_content
  before_validation :set_content

  def add_comment(comment)
    Comment.create(discussion: self, content: comment, article_id: article.id)
  end

  def set_content
    content = reader_url(article)
  end

  def to_activitypub_object
    Federails::DataTransformer::Note
      .to_federation(self, content: content)
  end

  def self.from_activitypub_object(hash)
    # Gets the timestamps values with a helper
    attrs = Federails::Utils::Object
            .timestamp_attributes(hash)
            # Complete attributes
            .merge(
              federated_url: hash['id'],
              content: hash['content']
            )

    # Find the parent if message is an answer
    # parent = Federails::Utils::Object.find_or_create! hash['inReplyTo'] if hash['inReplyTo'].present? 
    # attrs[:parent] = parent if parent

    attrs
  end
end
