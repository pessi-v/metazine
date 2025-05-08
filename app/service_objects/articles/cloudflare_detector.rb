module Articles
  class CloudflareDetector
    # Detects if a response is a Cloudflare challenge page
    # @param response [HTTPResponse, String] HTTP response or HTML content
    # @return [Boolean] true if Cloudflare challenge detected
    def self.is_cloudflare_challenge?(response)
      # Extract HTML content from different types of responses
      html = response.body

      return false if html.nil? || html.empty?

      # Check for multiple Cloudflare challenge indicators
      indicators = [
        # Title check
        html.include?("<title>Just a moment...</title>"),

        # Script check for cloudflare challenge
        html.include?("cdn-cgi/challenge-platform"),
        html.include?("_cf_chl_opt"),

        # Common cloudflare JS variable
        html.include?("window._cf_chl_opt"),

        # Common error text
        html.include?("challenge-error-text"),

        # Common meta refresh for cloudflare
        html.match(/<meta http-equiv="refresh"/i) && html.include?("__cf_chl"),

        # Ray ID - unique identifier for Cloudflare requests
        html.match(/cRay: '[a-z0-9]+'/i)
      ]

      # If at least 2 indicators are present, it's likely a Cloudflare challenge
      indicators.count { |indicator| indicator } >= 2
    end
  end
end
