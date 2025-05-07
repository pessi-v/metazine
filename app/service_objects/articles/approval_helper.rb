# frozen_string_literal: true

module Articles
  # ApprovalHelper contains custom rules to rule out articles that might be paywalled, announcements,
  # or content other than full articles.
  class ApprovalHelper
    FORBIDDEN_STRINGS = [
      "Of the principles and themes outlined in this issue, Tribune readers will easily discern." \
      " \u2018Gastropolitics\u2019 discusses how food matters to socialist politics. Food institutions historic," \
      " existing or imagined, are discussed, as well as the transformative urges behind their establishment."

    ].freeze

    def initialize(article)
      @article = article
    end

    def approve?
      return false if @article.readability_output_jsonb.blank?
      html_string = @article.readability_output_jsonb["content"]
      return false if html_string.blank?

      # filters some cases where no article is shown without Javascript or cookies,
      # and some cases of actually Video/Podcast content
      if @article.readability_output_jsonb["length"] && @article.readability_output_jsonb["length"] < 1900
        return false
      elsif FORBIDDEN_STRINGS.any? { |string| html_string.include?(string) }
        return false
      end

      true
    end
  end
end
