module HTTPRequestsHelper
  def self.make_request(source: nil, url: nil)
    connection = Faraday.new(
      url: source&.url || url,
      headers: {
        'If-Modified-Since': source&.last_modified,
        'If-None-Match': source&.etag,
        'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:127.0) Gecko/20100101 Firefox/127.0'
      },
      ssl: { verify: false }
    ) do |faraday|
      faraday.use FaradayMiddleware::FollowRedirects
      faraday.adapter :net_http # not sure if this is needed/helpful
    end
    
    response = connection.get

    if response.status == 500
      source.update(last_error_status: 'Internal Server Error (500)') if source
    end

    response

  rescue Faraday::ConnectionFailed => e
    puts source.name if source
    puts source.url if source
    puts e
    puts "URL DIDN'T WORK"
    source.update(last_error_status: 'connection_failed') if source
    return
  rescue URI::InvalidURIError => e
    puts source.name if source
    puts source.url if source
    puts e
    puts 'INVALID URL'
    source.update(last_error_status: 'invalid_url') if source
    return
  rescue Faraday::SSLError => e
    puts source.name if source
    puts source.url if source
    puts e
    puts 'SSL ERROR'
    source.update(last_error_status: 'ssl_error') if source
    return
  rescue Faraday::TimeoutError => e
    puts source.name if source
    puts source.url if source
    puts e
    puts 'TIMEOUT ERROR'
    source.update(last_error_status: 'timeout') if source
    return
  rescue FaradayMiddleware::RedirectLimitReached => e
    puts source.name if source
    puts source.url if source
    puts e
    puts 'REDIRECT LIMIT REACHED'
    source.update(last_error_status: 'redirect_limit_reached') if source
    return
  end
end

