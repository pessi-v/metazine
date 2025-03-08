module Fediverse
  class Signature
    class << self
      def sign(sender:, request:)
        private_key = OpenSSL::PKey::RSA.new sender.private_key, Rails.application.credentials.secret_key_base
        headers = '(request-target) host date digest'
        sig = Base64.strict_encode64(
          private_key.sign(
            OpenSSL::Digest.new('SHA256'), signature_payload(request: request, headers: headers)
          )
        )
        {
          keyId:     sender.key_id,
          headers:   headers,
          signature: sig,
        }.map { |k, v| "#{k}=\"#{v}\"" }.join(',')
      end

      def verify(sender:, request:)
        raise 'Unsigned headers' unless request.headers['Signature']

        signature_header = request.headers['Signature'].split(',').to_h do |pair|
          /\A(?<key>[\w]+)="(?<value>.*)"\z/ =~ pair
          [key, value]
        end

        headers   = signature_header['headers']
        signature = Base64.decode64(signature_header['signature'])
        key       = OpenSSL::PKey::RSA.new(sender.public_key)

        comparison_string = signature_payload(request: request, headers: headers)

        key.verify(OpenSSL::Digest.new('SHA256'), signature, comparison_string)
      end

      private

      def signature_payload(request:, headers:)
        headers.split.map do |signed_header_name|
          if signed_header_name == '(request-target)'
            "(request-target): #{request.http_method} #{URI.parse(request.path).path}"
          else
            "#{signed_header_name}: #{request.headers[signed_header_name.capitalize]}"
          end
        end.join("\n")
      end
    end
  end
end
