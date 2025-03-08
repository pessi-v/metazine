# frozen_string_literal: true

class Article < ApplicationRecord
  include PgSearch::Model

  belongs_to :source, counter_cache: true
  has_one :discussion, dependent: :destroy

  validates :title, :source_name, presence: true
  validates :title, uniqueness: true

  pg_search_scope :search_by_title_source_and_readability_output,
                  against: %i[title source_name readability_output],
                  using: { tsearch: { prefix: true } }, # tsearch = full text search
                  ignoring: :accents

  scope :today, -> { where('DATE(published_at) = CURRENT_DATE') }
  scope :yesterday, -> { where('DATE(published_at) = CURRENT_DATE - 1') }
  scope :days_ago, ->(days) { where("DATE(published_at) = CURRENT_DATE - #{days}") }

  def has_discussion?
    discussion.present?
  end

  def start_discussion(comment)
    discussion = Discussion.create(article: self, user: User.last, content: url)
    discussion.add_comment(comment)
  end
end
