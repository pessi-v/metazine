module Articles
  class CreateService
    require "faraday/gzip"

    def initialize(source, entry)
      @instance_actor = Federails::Actor.where(entity_type: "InstanceActor").first
      @source = source
      @entry = entry
      @entry_url = normalize_url(@entry.url)
      @cloudflare_blocked = false
      @original_page = fetch_original_page
      @description = make_description
      @clean_title = TextCleaner.clean_title(@entry.title)
    end

    def cloudflare_blocked?
      @cloudflare_blocked
    end

    def create_article
      return nil if !@original_page

      return if article_exists? || !english? || !allowed_media_type?

      article = Article.new(article_attributes)
      return unless ApprovalHelper.new(article, original_page_body: @original_page.body).approve?

      # clean up duplicate image, in case headline image is also in the text body
      article = ImageHelper.compare_and_update_article_images(article)

      # remove small images that would be hidden by CSS anyway
      article = ImageHelper.remove_small_images(article)

      article.save
      article
    end

    private

    def normalize_url(url)
      return url if url.nil?

      # If URL is already absolute, return it
      uri = URI.parse(url)
      return url if uri.absolute?

      # If URL is relative, combine with source's base URL
      source_uri = URI.parse(@source.url)
      base_url = "#{source_uri.scheme}://#{source_uri.host}"
      base_url += ":#{source_uri.port}" if source_uri.port && ![80, 443].include?(source_uri.port)

      URI.join(base_url, url).to_s
    rescue URI::InvalidURIError => e
      Rails.logger.error("Failed to normalize URL #{url}: #{e.message}")
      url
    end

    def article_exists?
      Article.where("articles.title = ? OR articles.url = ?", @clean_title, @entry_url).exists?
    end

    def english?
      text = @description.presence || @clean_title
      CLD.detect_language(text)[:code] == "en"
    end

    def allowed_media_type?
      return true if @entry.categories.nil?

      audio_categories = %w[Podcast Audio]
      return false if @entry.categories.include?("Video") && !@source.allow_video
      return false if (@entry.categories & audio_categories).any? && !@source.allow_audio

      true
    end

    def article_attributes
      readability_output = article_readability_output(@original_page.body)
      # TODO: remove this once we have a way to handle the tags
      {
        title: @clean_title,
        description: @description,
        # summary: summary, # TODO: drop summary column from table
        description_length: @description.length,
        url: @entry_url,
        source_name: @source.name,
        source_id: @source.id,
        published_at: determine_published_at,
        image_url: find_image_url,
        readability_output_jsonb: readability_output,
        # tags: readability_output["tags"],
        federails_actor: @instance_actor
      }
    end

    def make_description
      # Use OG:Description if present
      og_description = fetch_og_data&.description
      return TextCleaner.clean_description(og_description) if og_description

      entry_summary = @entry.summary.presence
      return TextCleaner.clean_description(entry_summary) if entry_summary

      # Use entry Summary if present, or take a part of main text
      text = @entry.content.presence
      text ? TextCleaner.clean_description(text) : nil
    end

    def determine_published_at
      return Time.current if @entry.published.blank?

      timestamp = Time.zone.parse(@entry.published.to_s)
      (timestamp > Time.current) ? Time.current : timestamp
    end

    def find_image_url
      return unless @source.show_images

      ImageFinder.new(entry: @entry, og_data: fetch_og_data).find_url
    end

    def fetch_original_page
      begin
        # Try your current approach first
        connection = Faraday.new do |conn|
          conn.use Faraday::Gzip::Middleware
          conn.response :follow_redirects, limit: 5
          conn.options.timeout = 30
          conn.options.open_timeout = 10
        end

        response = connection.get(@entry_url) do |req|
          # Mimic a modern browser
          req.headers["User-Agent"] =
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
          req.headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
          req.headers["Accept-Language"] = "en-US,en;q=0.5"
          req.headers["Accept-Encoding"] = "gzip, deflate, br"
          req.headers["Connection"] = "keep-alive"
          req.headers["Upgrade-Insecure-Requests"] = "1"
          req.headers["Sec-Fetch-Dest"] = "document"
          req.headers["Sec-Fetch-Mode"] = "navigate"
          req.headers["Sec-Fetch-Site"] = "none"
          req.headers["Sec-Fetch-User"] = "?1"
        end

        if CloudflareDetector.is_cloudflare_challenge?(response)
          # Handle the challenge case
          Rails.logger.warn "Cloudflare challenge detected when accessing #{@entry_url}"
          @cloudflare_blocked = true
          return false
        end

        return response if response.status == 200
      rescue Faraday::TimeoutError, Faraday::ConnectionFailed => e
        Rails.logger.info("Failed to fetch with full headers for #{@entry_url}: #{e.message}. Trying simplified approach.")
      end

      # Fallback to a simpler request if the first attempt fails
      connection = Faraday.new do |conn|
        conn.response :follow_redirects, limit: 5
      end
      response = connection.get(@entry_url)

      if CloudflareDetector.is_cloudflare_challenge?(response)
        # Handle the challenge case
        Rails.logger.warn "Cloudflare challenge detected when accessing #{@entry_url}"
        @cloudflare_blocked = true
        return false
      end

      response
    end

    def fetch_og_data
      return nil if !@original_page || @original_page.body.empty?

      @fetch_og_data ||= OGP::OpenGraph.new(@original_page.body, required_attributes: [])
    rescue OGP::MalformedSourceError
      # TODO
    end

    def article_readability_output(html)
      readability_output = ReadabilityService.new(html).parse

      if @source&.url&.match?("https://chuangcn.org")
        readability_output = ChuangHelper.new(readability_output).remove_chinese_section
      end

      readability_output
    end
  end
end
