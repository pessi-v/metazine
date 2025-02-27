# frozen_string_literal: true

module Articles
  class CreateService
    require 'faraday/gzip'

    def initialize(source, entry)
      @source = source
      @entry = entry
      @original_page = fetch_original_page
      @description = description
      @clean_title = clean_title
    end

    def create_article
      return if article_exists? || !english? || !allowed_media_type?

      article = Article.new(article_attributes)
      return unless ApprovalHelper.new(article).approve?

      article.save
    end

    private

    def disapprove?
      ApprovalHelper
    end

    # attr_reader :source, :entry, :original_page

    def article_exists?
      Article.where('articles.title = ? OR articles.url = ?', @clean_title, @entry.url).exists?
    end

    def english?
      text = @description.presence || @clean_title
      CLD.detect_language(text)[:code] == 'en'
    end

    def allowed_media_type?
      return false if @entry.categories.include?('Video') && !@source.allow_video
      return false if @entry.categories.intersect?(%w[Podcast Audio]) && !@source.allow_audio

      true
    end

    def article_attributes
      {
        title: @clean_title,
        description: @description,
        # summary: summary, # TODO: drop summary column from table
        description_length: @description.length,
        url: @entry.url,
        source_name: @source.name,
        source_id: @source.id,
        published_at: determine_published_at,
        image_url: find_image_url,
        paywalled: paywalled?,
        readability_output: article_readability_output(@original_page.body),
        readability_output_jsonb: article_readability_output(@original_page.body)
      }
    end

    def clean_title
      TextCleaner.new(@entry.title).clean_title
    end

    def description
      # Use OG:Description if present
      og_description = fetch_og_data&.description
      return @description = TextCleaner.new(og_description).clean if og_description

      # Use entry Summary if present, or take a part of main text
      @description ||= begin
        text = @entry.summary.presence || entry.content.presence
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

    def truncate_summary(text, length: 350)
      return text if text.length <= length

      "#{text[0..length]}…"
    end

    def determine_published_at
      return Time.current if @entry.published.blank?

      timestamp = Time.zone.parse(@entry.published.to_s)
      timestamp > Time.current ? Time.current : timestamp
    end

    def find_image_url
      return unless @source.show_images

      ImageFinder.new(entry: @entry, og_data: fetch_og_data).find_url
    end

    def fetch_original_page
      # binding.break
      # connection = Faraday.new do |conn|
      #   conn.use Faraday::Gzip::Middleware
      # end
      # connection.get(@entry.url) do |req|
      #   # Mimic a modern browser
      #   req.headers['User-Agent'] =
      #     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
      #   req.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      #   req.headers['Accept-Language'] = 'en-US,en;q=0.5'
      #   req.headers['Accept-Encoding'] = 'gzip, deflate, br'
      #   req.headers['Connection'] = 'keep-alive'
      #   req.headers['Upgrade-Insecure-Requests'] = '1'
      #   req.headers['Sec-Fetch-Dest'] = 'document'
      #   req.headers['Sec-Fetch-Mode'] = 'navigate'
      #   req.headers['Sec-Fetch-Site'] = 'none'
      #   req.headers['Sec-Fetch-User'] = '?1'
      # end

      begin
        # Try your current approach first
        connection = Faraday.new do |conn|
          conn.use Faraday::Gzip::Middleware
          conn.options.timeout = 30
          conn.options.open_timeout = 10
        end
        
        response = connection.get(@entry.url) do |req|
          # Mimic a modern browser
          req.headers['User-Agent'] =
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
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
        
        return response if response.status == 200
      rescue Faraday::TimeoutError, Faraday::ConnectionFailed => e
        Rails.logger.warn("Failed to fetch with full headers for #{@entry.url}: #{e.message}. Trying simplified approach.")
      end
      
      # Fallback to a simpler request if the first attempt fails
      Faraday.get(@entry.url)
    end

    def fetch_og_data
      return nil if @original_page.body.empty?

      @fetch_og_data ||= OGP::OpenGraph.new(@original_page.body, required_attributes: [])
    end

    def paywalled?
      return false unless (response_body = @original_page.body)

      doc = Nokogiri::HTML(response_body)

      # Check for the presence of paywall form div
      return true if doc.css('#paywall-form').any?

      # Check for paywall message text
      paywall_message = doc.css('.po-ln__message')
      return true if paywall_message.text.include?('available to subscribers only')

      # Check if intro section ends with ellipsis [...] which indicates truncated content
      intro_section = doc.css('.po-cn__intro').text
      return true if intro_section&.strip&.end_with?('[…]')

      false
    end

    def article_readability_output(html)
      # binding.pry
      readability_output = ReadabilityService.new(html).parse

      if @source&.url&.match?('https://chuangcn.org')
        readability_output = ChuangHelper.new(readability_output).remove_chinese_section
      end

      readability_output
    end
  end
end
