# frozen_string_literal: true

module Articles
  class CreateService
    def initialize(source, entry)
      @source = source
      @entry = entry
    end

    def create_article
      return if article_exists? || !english? || !allowed_media_type?

      Article.create!(article_attributes)
    end

    private

    attr_reader :source, :entry

    def article_exists?
      Article.where('articles.title = ? OR articles.url = ?', clean_title, entry.url).exists?
    end

    def english?
      text = summary.presence || clean_title
      CLD.detect_language(text)[:code] == 'en'
    end

    def allowed_media_type?
      return false if entry.categories.include?('Video') && !source.allow_video
      return false if (entry.categories.intersect?(['Podcast', 'Audio'])) && !source.allow_audio
      true
    end

    def article_attributes
      {
        title: clean_title,
        description: fetch_og_data.description,
        summary: summary,
        url: entry.url,
        source_name: source.name,
        source_id: source.id,
        published_at: determine_published_at,
        image_url: find_image_url
      }
    end

    def clean_title
      @clean_title ||= TextCleaner.new(entry.title).clean_with_parentheses
    end

    def summary
      @summary ||= begin
        text = entry.summary.presence || entry.content.presence
        return nil unless text

        cleaned_text = TextCleaner.new(text).clean
        truncate_summary(cleaned_text)
      end
    end

    def truncate_summary(text, length: 700)
      return text if text.length <= length
      "#{text[0..length]}…"
    end

    def determine_published_at
      return Time.current if entry.published.blank?
      
      timestamp = Time.zone.parse(entry.published.to_s)
      timestamp > Time.current ? Time.current : timestamp
    end

    def find_image_url
      return unless source.show_images
      
      ImageFinder.new(entry: entry, og_data: fetch_og_data).find_url
    end

    def fetch_og_data
      @og_data ||= begin
        response = Faraday.get(entry.url)
        OGP::OpenGraph.new(response.body, required_attributes: [])
      end
    end
  end

  class TextCleaner
    def initialize(text)
      @text = text
    end

    def clean
      text
        .force_encoding('utf-8')
        .then { |t| strip_formatting(t) }
        .then { |t| remove_special_characters(t) }
        .then { |t| fix_spacing(t) }
        .then { |t| handle_ellipsis(t) }
        .then { |t| clean_head_and_tail(t) }
        .strip
    end

    def clean_with_parentheses
      clean_parentheses(clean)
    end

    private

    attr_reader :text

    def strip_formatting(text)
      text = ApplicationController.helpers.strip_links(text)
      text = text.sanitize
      text = ApplicationController.helpers.strip_tags(text)
      CGI.unescapeHTML(text)
    end

    def remove_special_characters(text)
      text.delete("\t").delete("\n")
    end

    def fix_spacing(text)
      text = text.squeeze(' ').squeeze('*')
      text = text.gsub(/\&nbsp;/, " ")
      text.gsub(/([,\.!?:;])(\S)/, '\1 \2')
    end

    def handle_ellipsis(text)
      return remove_last_sentence(text) if text.end_with?('[…]')
      text
    end

    def clean_head_and_tail(text)
      text = remove_head_tag(text)
      text = handle_tail_ellipsis(text)
      text = text.capitalize if text == text.upcase
      text
    end

    def remove_head_tag(text)
      return text unless text.start_with?('[') && text.match?(']')
      
      closure = text.index(']')
      text[(closure + 1)..]
    end

    def handle_tail_ellipsis(text)
      if (ellipsis = text.index(/(\[…\]){1}/))
        "#{text[0..ellipsis - 1].strip}…"
      elsif (ellipsis = text.index(/…{1}/))
        text[0..ellipsis]
      else
        text
      end
    end

    def clean_parentheses(text)
      return text unless (open_parenthesis = text.rindex('('))
      return text unless (close_parenthesis = text[open_parenthesis..].index(')'))

      cleaned_text = text[0...open_parenthesis] + text[open_parenthesis + close_parenthesis + 1..]
      clean_parentheses(cleaned_text)
    end

    def remove_last_sentence(text)
      last_punctuation_index = text.rindex(/[.!?]/)
      text[0..last_punctuation_index]
    end
  end

  class ImageFinder
    def initialize(entry:, og_data:)
      @entry = entry
      @og_data = og_data
    end

    def find_url
      find_og_image || find_entry_image
    end

    private

    attr_reader :entry, :og_data

    def find_og_image
      return unless og_data&.image&.url.present?
      
      url = og_data.image.url
      return url if valid_image_url?(url)
      nil
    end

    def find_entry_image
      return unless entry.image.present?
      
      url = sanitize_url(entry.image)
      return url if url && valid_image_url?(url)
      nil
    end

    def valid_image_url?(url)
      response = Faraday.get(url)
      response.status == 200 && response.headers['content-type']&.match?('image')
    rescue Faraday::Error
      false
    end

    def sanitize_url(url)
      Addressable::URI.parse(url).normalize.to_s
    rescue Addressable::URI::InvalidURIError
      nil
    end
  end
end