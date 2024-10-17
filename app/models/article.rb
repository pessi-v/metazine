class Article < ApplicationRecord
  include PgSearch::Model

  belongs_to :source, counter_cache: true

  validates :title, :source_name, presence: true
  validates :title, uniqueness: true

  pg_search_scope :search_by_title_source_and_readability_output,
                  against: %i[title source_name readability_output],
                  using: { tsearch: { prefix: true } }, # tsearch = full text search
                  ignoring: :accents

  scope :today, -> { where('DATE(published_at) = CURRENT_DATE') }
  scope :yesterday, -> { where('DATE(published_at) = CURRENT_DATE - 1') }
  scope :days_ago, ->(days) { where("DATE(published_at) = CURRENT_DATE - #{days}") } 

  def fedi_object
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://newfutu.re/reader/#{id}",
      "type": "Note",
      "content": summary,
      "url": url,
      "attributedTo": [
        { "name": source_name }
      ],
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "cc": [],
      "published": published_at.iso8601
    }
  end

  def fedi_activity_and_object
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "type": "Create",
      "id": "https://newfutu.re/reader/#{id}",
      "actor": "https://newfutu.re/@editor",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "cc": [],
      "published": published_at.iso8601,
      "object": fedi_object
    }
  end
end
