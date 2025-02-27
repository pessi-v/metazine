# frozen_string_literal: true

class Discussion < ApplicationRecord
  belongs_to :article
  has_many :comments, dependent: :destroy
  validates :article_id, uniqueness: true

  
  # validates :title, presence: true
  # validates :content, presence: true

  def add_comment(content)
    Comment.create(discussion: self, content: content)
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
