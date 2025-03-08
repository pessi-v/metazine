module Federails
  module Utils
    class Host
      class << self
        COMMON_PORTS = [80, 443].freeze

        ##
        # @return [String] Host and port of the current instance
        def localhost
          uri = URI.parse Federails.configuration.site_host
          host_and_port (uri.host || 'localhost'), Federails.configuration.site_port
        end

        ##
        # Checks if the given URL points somewhere on current instance
        #
        # @param url [String] URL to check
        #
        # @return [true, false]
        def local_url?(url)
          uri = URI.parse url
          host = host_and_port uri.host, uri.port
          localhost == host
        end

        ##
        # Gets the route on the current instance, or nil
        #
        # @param url [String] URL to check
        #
        # @return [ActionDispatch::Routing::RouteSet, nil] nil when URL do not match a route
        def local_route(url)
          return nil unless local_url? url

          Rails.application.routes.recognize_path(url)
        rescue ActionController::RoutingError
          nil
        end

        private

        def host_and_port(host, port)
          port_string = if port.present? && COMMON_PORTS.exclude?(port)
                          ":#{port}"
                        else
                          ''
                        end

          "#{host}#{port_string}"
        end
      end
    end
  end
end
