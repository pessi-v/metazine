# frozen_string_literal: true

module Articles
  # ApprovalHelper contains custom rules to rule out articles that might be paywalled, announcements,
  # or content other than full articles.
  class ApprovalHelper
    FORBIDDEN_STRINGS = [
      'Of the principles and themes outlined in this issue, Tribune readers will easily discern.'\
      ' ‘Gastropolitics’ discusses how food matters to socialist politics. Food institutions historic,'\
      ' existing or imagined, are discussed, as well as the transformative urges behind their establishment.'

    ].freeze

    def initialize(article)
      @article = article
    end

    def approve?
      html_string = @article.readability_output

      # filters some cases where no article is shown without Javascript or cookies,
      # and some cases of actually Video/Podcast content
      if html_string.nil? || html_string.length < 1900
        return false
      elsif FORBIDDEN_STRINGS.any? { |string| html_string.include?(string) }
        return false
      end

      true
    end
  end
end
