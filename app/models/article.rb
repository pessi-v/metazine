# frozen_string_literal: true

class Article < ApplicationRecord
  include PgSearch::Model

  include ActionView::Helpers::TagHelper
  include ActionView::Context
  include Rails.application.routes.url_helpers

  belongs_to :source, counter_cache: true
  belongs_to :federails_actor, optional: true, class_name: "Federails::Actor"

  has_many :comments, dependent: :delete_all, as: :parent

  validates :title, :source_name, presence: true
  validates :title, uniqueness: true
  validates :description, presence: true, allow_blank: false

  before_save :extract_searchable_content

  pg_search_scope :search_by_title_source_and_readability_output,
    against: %i[title source_name searchable_content],
    using: {tsearch: {prefix: true}},
    ignoring: :accents

  scope :today, -> { where("DATE(published_at) = CURRENT_DATE") }
  scope :yesterday, -> { where("DATE(published_at) = CURRENT_DATE - 1") }
  scope :days_ago, ->(days) { where("DATE(published_at) = CURRENT_DATE - #{days}") }

  def should_federate?
    read_attribute(:federated_url).present?
  end

  private

  def extract_searchable_content
    return unless readability_output_jsonb.present? && readability_output_jsonb["content"].present?
    return if !readability_output_jsonb_changed? && searchable_content.present?

    html_content = readability_output_jsonb["content"]
    doc = Nokogiri::HTML(html_content)
    doc.css('script, style').remove
    text = doc.text.gsub(/\s+/, ' ').strip
    self.searchable_content = text[0...10000]
  end
end
