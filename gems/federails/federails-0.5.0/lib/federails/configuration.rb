module Federails
  # rubocop:disable Style/ClassVars

  # Stores the Federails configuration in a _singleton_.
  module Configuration
    # Application name, used in well-known and nodeinfo endpoints
    mattr_accessor :app_name
    @@app_name = nil

    # Application version, used in well-known and nodeinfo endpoints
    mattr_accessor :app_version
    @@app_version = nil

    # Force https urls in various rendered content (currently in webfinger views)
    mattr_accessor :force_ssl
    @@force_ssl = nil

    # Site hostname
    mattr_reader :site_host
    @@site_host = nil

    # Site port
    mattr_reader :site_port
    @@site_port = nil

    # Whether to enable ".well-known" and "nodeinfo" endpoints
    mattr_accessor :enable_discovery
    @@enable_discovery = true

    # Does the site allow open registrations? (only used for nodeinfo reporting)
    mattr_accessor :open_registrations
    @@open_registrations = false

    # Application layout
    mattr_accessor :app_layout
    @@app_layout = nil

    # Route path for the federation URLs (to "Federails::Server::*" controllers)
    mattr_accessor :server_routes_path
    @@server_routes_path = :federation

    # Route path for the webapp URLs (to "Federails::Client::*" controllers)
    mattr_accessor :client_routes_path
    @@client_routes_path = :app

    # Default controller to use as base for client controllers
    mattr_accessor :base_client_controller
    @@base_client_controller = 'ActionController::Base'

    # @!method self.remote_follow_url_method
    #
    # Route method for remote-following requests

    # @!method self.remote_follow_url_method=(value)
    #
    # Sets the route method for remote-following requests
    # @param value [String] Route method name as used in links
    # @example
    #   remote_follow_url_method 'main_app.my_custom_route_helper'
    mattr_accessor :remote_follow_url_method
    @@remote_follow_url_method = 'federails.new_client_following_url'

    def self.site_host=(value)
      @@site_host = value
      Federails::Engine.routes.default_url_options[:host] = value
    end

    def self.site_port=(value)
      @@site_port = value
      Federails::Engine.routes.default_url_options[:port] = value
    end

    # List of actor types (classes using Federails::ActorEntity)
    mattr_reader :actor_types
    @@actor_types = {}

    def self.register_actor_class(klass, config = {})
      @@actor_types[klass.name] = config.merge(class: klass)
    end

    # List of data types (classes using Federails::DataEntity)
    mattr_reader :data_types
    @@data_types = {}

    def self.register_data_type(klass, config = {})
      @@data_types[klass.name] = config.merge(class: klass)
    end
  end
  # rubocop:enable Style/ClassVars
end
