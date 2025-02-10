module Articles
  class ImageFinder
    def initialize(entry:, og_data:)
      @entry = entry
      @og_data = og_data
    end

    def find_url
      url = find_og_image || find_entry_image
      url&.start_with?('http://') ? nil : url
    end

    private

    attr_reader :entry, :og_data

    def find_og_image
      return if og_data&.image&.url.blank?

      url = sanitize_url(og_data.image.url)
      return url if valid_image_url?(url)

      nil
    end

    def find_entry_image
      return if entry.image.blank?

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