# Patch federails webfinger to use signed GET requests
require_relative '../../lib/fediverse/signed_request'

module Fediverse
  class Webfinger
    class << self
      prepend(Module.new do
        private

        def get_json(url, params = {})
          # Try signed request first
          begin
            instance_actor = InstanceActor.first&.federails_actor
            if instance_actor&.private_key.present?
              Rails.logger.debug { "Fetching #{url} with signed request" }
              return Fediverse::SignedRequest.get_json(
                url,
                params: params,
                from: instance_actor,
                headers: { accept: 'application/activity+json' },
                follow_redirects: true
              )
            end
          rescue => e
            Rails.logger.debug { "Signed request failed, falling back to unsigned: #{e.message}" }
          end

          # Fall back to original unsigned request
          super
        end
      end)
    end
  end
end
