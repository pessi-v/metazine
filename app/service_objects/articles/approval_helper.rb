# frozen_string_literal: true

module Articles
  # ApprovalHelper contains custom rules to rule out articles that might be paywalled, announcements,
  # or content other than full articles.
  class ApprovalHelper
    FORBIDDEN_STRINGS = [
      "Of the principles and themes outlined in this issue, Tribune readers will easily discern." \
      " \u2018Gastropolitics\u2019 discusses how food matters to socialist politics. Food institutions historic," \
      " existing or imagined, are discussed, as well as the transformative urges behind their establishment.",
      "This article can be read by subscribers",
      "Full article",
      "Sorry, but this article is available to subscribers only",
      "For just $19.95 a year",
      "It only takes 2 minutes to subscribe"
    ].freeze

    def initialize(article, original_page_body: nil)
      @article = article
      @original_page_body = original_page_body
    end

    def approve?(title = nil)
      @title = title || @article.title

      if @article.readability_output_jsonb.blank?
        log_rejection("Readability output is blank")
        return false
      end

      html_string = @article.readability_output_jsonb["content"]
      if html_string.blank?
        log_rejection("Readability content is blank")
        return false
      end

      # Skip paywalled articles
      if paywalled?
        log_rejection("Paywall detected")
        return false
      end

      # filters some cases where no article is shown without Javascript or cookies,
      # and some cases of actually Video/Podcast content
      content_length = @article.readability_output_jsonb["length"]
      if content_length && content_length < 1900
        log_rejection("Content too short (#{content_length} chars, minimum: 1900)")
        return false
      end

      matched_string = FORBIDDEN_STRINGS.find { |string| html_string.include?(string) }
      if matched_string
        log_rejection("Contains forbidden string: '#{matched_string.truncate(50)}'")
        return false
      end

      true
    end

    private

    def log_rejection(reason)
      Rails.logger.info("[Article Rejected] '#{@title}' - #{reason}")
    end

    def paywalled?
      return false unless @original_page_body

      doc = Nokogiri::HTML(@original_page_body)

      # Check for the presence of paywall form div
      return true if doc.css("#paywall-form").any?

      # Check for paywall message text
      paywall_message = doc.css(".po-ln__message")
      return true if paywall_message.text.include?("available to subscribers only")

      # Check if intro section ends with ellipsis [...] which indicates truncated content
      intro_section = doc.css(".po-cn__intro").text
      return true if intro_section&.strip&.end_with?("[\u2026]")

      false
    end
  end
end
