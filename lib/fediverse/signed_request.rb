require 'fediverse/signature'

module Fediverse
  # Utility for making signed HTTP requests to remote ActivityPub servers
  class SignedRequest
    class << self
      # Makes a signed GET request and returns parsed JSON
      #
      # @param url [String] Target URL
      # @param params [Hash] Query string parameters
      # @param from [Federails::Actor] Actor to sign the request with (defaults to instance actor)
      # @param headers [Hash] Additional headers to include
      # @param follow_redirects [Boolean] Whether to follow redirects
      # @param expected_status [Integer] Expected response status
      #
      # @return [Hash] Parsed JSON response
      #
      # @raise [Federails::Utils::JsonRequest::UnhandledResponseStatus] when status doesn't match expected
      # @raise [ActiveRecord::RecordNotFound] when request fails
      def get_json(url, params: {}, from: nil, headers: {}, follow_redirects: false, expected_status: 200)
        # Use instance actor if no sender specified
        from ||= InstanceActor.first&.federails_actor

        unless from&.private_key.present?
          Rails.logger.error "No signing actor available for signed GET request to #{url}"
          raise ActiveRecord::RecordNotFound, "Cannot sign request without actor"
        end

        # Build the signed request
        req = build_signed_get_request(url: url, params: params, from: from, headers: headers)

        # Execute the request
        connection = Faraday.new do |faraday|
          faraday.response :follow_redirects if follow_redirects
          faraday.adapter Faraday.default_adapter
        end

        response = connection.run_request(req.http_method, req.path, nil, req.headers)

        if expected_status && response.status != expected_status
          Rails.logger.debug { "Signed GET to #{url} returned #{response.status}, expected #{expected_status}" }
          raise Federails::Utils::JsonRequest::UnhandledResponseStatus,
                "Unhandled status code #{response.status} for GET #{url}"
        end

        JSON.parse(response.body)
      rescue Faraday::ConnectionFailed => e
        Rails.logger.debug { "Failed to reach server for GET #{url}: #{e.message}" }
        raise ActiveRecord::RecordNotFound
      rescue JSON::ParserError => e
        Rails.logger.debug { "Invalid JSON response for GET #{url}: #{e.message}" }
        raise ActiveRecord::RecordNotFound
      end

      private

      def build_signed_get_request(url:, params:, from:, headers:)
        uri = URI.parse(url)
        uri.query = URI.encode_www_form(params) if params.any?

        Faraday.default_connection.build_request(:get) do |req|
          req.url uri.to_s
          req.headers['Accept'] = headers[:accept] || 'application/activity+json, application/ld+json'
          req.headers['Host'] = uri.host
          req.headers['Date'] = Time.now.utc.httpdate

          # Add any additional headers
          headers.except(:accept).each do |key, value|
            req.headers[key.to_s.capitalize] = value
          end

          # Sign the request (GET requests don't have a Digest header)
          req.headers['Signature'] = sign_get_request(sender: from, request: req)
        end
      end

      def sign_get_request(sender:, request:)
        private_key = OpenSSL::PKey::RSA.new(sender.private_key, Rails.application.credentials.secret_key_base)

        # For GET requests, we sign: (request-target), host, and date
        # (no digest since there's no body)
        # All header names must be lowercase per cavage-12
        headers = '(request-target) host date'

        signature_string = build_signature_string(request: request, headers: headers)

        sig = Base64.strict_encode64(
          private_key.sign(OpenSSL::Digest.new('SHA256'), signature_string)
        )

        # Build the signature header per cavage-12 section 4
        # Using rsa-sha256 algorithm (widely supported in the fediverse)
        {
          keyId: sender.key_id,
          algorithm: 'rsa-sha256',
          headers: headers,
          signature: sig,
        }.map { |k, v| "#{k}=\"#{v}\"" }.join(',')
      end

      def build_signature_string(request:, headers:)
        # Build the signature string per cavage-12 section 2.3
        # Format: "lowercased_header_name: header_value\n..." (no trailing newline)
        headers.split.map do |signed_header_name|
          if signed_header_name == '(request-target)'
            # Per cavage-12: "(request-target): lowercase_method path"
            # The path includes query string if present
            uri = URI.parse(request.path)
            path_with_query = uri.query ? "#{uri.path}?#{uri.query}" : uri.path
            "(request-target): get #{path_with_query}"
          else
            # All header names are lowercase, but values keep their casing
            # We need to look up the header with proper casing from the request
            header_value = request.headers[signed_header_name.capitalize] ||
                          request.headers[signed_header_name.downcase] ||
                          request.headers[signed_header_name]
            "#{signed_header_name}: #{header_value}"
          end
        end.join("\n")
      end
    end
  end
end
