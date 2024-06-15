class Article < ApplicationRecord
  include PgSearch::Model

  validates :title, :source_name, presence: true
  validates :title, uniqueness: true

  pg_search_scope :search_by_title_source_and_readability_output,
                  against: %i[title source_name readability_output],
                  using: { tsearch: { prefix: true } }, # tsearch = full text search
                  ignoring: :accents

  scope :today, -> { where('DATE(published_at) = CURRENT_DATE') }
  scope :yesterday, -> { where('DATE(published_at) = CURRENT_DATE - 1') }
  scope :days_ago, ->(days) { where("DATE(published_at) = CURRENT_DATE - #{days}") } 
end
