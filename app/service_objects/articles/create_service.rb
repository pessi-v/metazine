# frozen_string_literal: true

module Articles
  class CreateService
    require 'faraday/gzip'

    def initialize(source, entry)
      @source = source
      @entry = entry
    end

    def create_article
      return if article_exists? || !english? || !allowed_media_type?

      # Article.create!(article_attributes) # will raise an error 
      Article.create(article_attributes) # don't raise errors such as ActiveRecord::RecordNotUnique, just move on
    end

    private

    attr_reader :source, :entry

    def article_exists?
      Article.where('articles.title = ? OR articles.url = ?', clean_title, entry.url).exists?
    end

    def english?
      text = description.presence || clean_title
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
        description: @description,
        # summary: summary, # TODO: drop summary column from table
        description_length: @description.length,
        url: entry.url,
        source_name: source.name,
        source_id: source.id,
        published_at: determine_published_at,
        image_url: find_image_url,
        paywalled: paywalled?
      }
    end

    def clean_title
      @clean_title ||= TextCleaner.new(entry.title).clean_with_parentheses
    end

    def description
      # Use OG:Description if present
      og_description = fetch_og_data.description
      if og_description
        return @description = TextCleaner.new(og_description).clean
      end

      # Use entry Summary if present, or take a part of main text
      @description ||= begin
        text = entry.summary.presence || entry.content.presence
        return nil unless text

        cleaned_text = TextCleaner.new(text).clean
        truncate_summary(cleaned_text)
      end
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

    def fetch_original_page
      connection = Faraday.new do |conn|
        conn.use Faraday::Gzip::Middleware
      end
      @original_page_response ||= connection.get(entry.url) do |req|
        # Mimic a modern browser
        req.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        req.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        req.headers['Accept-Language'] = 'en-US,en;q=0.5'
        req.headers['Accept-Encoding'] = 'gzip, deflate, br'
        req.headers['Connection'] = 'keep-alive'
        req.headers['Upgrade-Insecure-Requests'] = '1'
        req.headers['Sec-Fetch-Dest'] = 'document'
        req.headers['Sec-Fetch-Mode'] = 'navigate'
        req.headers['Sec-Fetch-Site'] = 'none'
        req.headers['Sec-Fetch-User'] = '?1'
      end
    end

    def fetch_og_data
      @og_data ||= begin
        response = fetch_original_page
        OGP::OpenGraph.new(response.body, required_attributes: [])
      end
    end

    def paywalled?
      return false unless response_body = fetch_original_page.body
    
      doc = Nokogiri::HTML(response_body)
      
      # Check for the presence of paywall form div
      return true if doc.css('#paywall-form').any?
      
      # Check for paywall message text
      paywall_message = doc.css('.po-ln__message')
      return true if paywall_message.text.include?("available to subscribers only")
      
      # Check if intro section ends with ellipsis [...] which indicates truncated content
      intro_section = doc.css('.po-cn__intro').text
      return true if intro_section&.strip&.end_with?("[…]")
      
      false
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