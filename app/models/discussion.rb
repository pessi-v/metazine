# frozen_string_literal: true

class Discussion < ApplicationRecord
  include Federails::DataEntity
  
  acts_as_federails_data(handles: 'Note', actor_entity_method: :user)
  
  belongs_to :article, optional: false
  belongs_to :user
  has_many :comments, dependent: :destroy
  validates :article_id, uniqueness: true
  validates :content, presence: true, allow_blank: false

  # before_validation :set_content
  before_validation :set_content

  

  
  # validates :title, presence: true
  # validates :content, presence: true

  def add_comment(content)
    Comment.create(discussion: self, content: content)
  end

  def set_content
    content = reader_url(article)
  end

  def to_activitypub_object
    Federails::DataTransformer::Note.to_federation self,
                                                   content:   content
  end

  def self.from_activitypub_object(hash)
    # Gets the timestamps values with a helper
    attrs = Federails::Utils::Object.timestamp_attributes(hash)
                                    # Complete attributes
                                    .merge federated_url: hash['id'],
                                           content:       hash['content']

    # Find the parent if message is an answer
    # parent = Federails::Utils::Object.find_or_create! hash['inReplyTo'] if hash['inReplyTo'].present? 
    # attrs[:parent] = parent if parent

    attrs
  end


  
  # ActivityPub fields
  # These will be used for federation
  # Uncomment and implement as needed
  # 
  # has_one :actor, as: :actable, class_name: 'Federails::Actor', dependent: :destroy
  # has_many :activities, as: :activable, class_name: 'Federails::Activity', dependent: :destroy
  
  # after_create :create_actor
  # after_save :update_actor
  
  # def create_actor
  #   build_actor(
  #     username: "discussion_#{id}",
  #     display_name: title,
  #     summary: content.truncate(150),
  #     inbox_url: Rails.application.routes.url_helpers.article_discussion_path(article, self),
  #     outbox_url: Rails.application.routes.url_helpers.article_discussion_path(article, self)
  #   ).save
  # end
  
  # def update_actor
  #   actor.update(
  #     display_name: title,
  #     summary: content.truncate(150)
  #   ) if actor.present?
  # end
  
  # def federate_create
  #   # Implement federation logic
  # end
end
