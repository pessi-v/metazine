require "net/http"
require "uri"

# Transparently forwards ActivityPub paths to the Fedify sidecar.
# Only active when FEDIFY_INTERNAL_URL is set.
class FedifyProxy
  PROXIED_PREFIXES = %w[/ap/ /.well-known/webfinger /.well-known/nodeinfo].freeze

  def initialize(app)
    @app = app
    @target = ENV["FEDIFY_INTERNAL_URL"].then { |u| URI.parse(u) if u }
  end

  def call(env)
    return @app.call(env) unless @target && proxied?(env["PATH_INFO"])

    request = Rack::Request.new(env)
    forward(request)
  rescue => e
    Rails.logger.error "[FedifyProxy] #{e.class}: #{e.message}"
    [ 502, { "content-type" => "text/plain" }, [ "Bad Gateway" ] ]
  end

  private

  def proxied?(path)
    PROXIED_PREFIXES.any? { |prefix| path.start_with?(prefix) }
  end

  def forward(request)
    uri = URI.parse("#{@target}#{request.fullpath}")

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == "https"

    upstream = Net::HTTP::const_get(request.request_method.capitalize).new(uri.request_uri)

    request.env.each do |key, value|
      next unless key.start_with?("HTTP_") && value.is_a?(String)
      upstream[key[5..].tr("_", "-").downcase] = value
    end
    upstream["content-type"] = request.env["CONTENT_TYPE"] if request.env["CONTENT_TYPE"].present?
    # Preserve the public Host header — HTTP signatures are computed against it
    upstream["host"] = request.env["HTTP_HOST"] || request.host
    upstream.body = request.body.read if request.body

    response = http.request(upstream)

    headers = {}
    response.each_header { |k, v| headers[k] = v }
    headers.delete("transfer-encoding")

    [ response.code.to_i, headers, [ response.body.to_s ] ]
  end
end
