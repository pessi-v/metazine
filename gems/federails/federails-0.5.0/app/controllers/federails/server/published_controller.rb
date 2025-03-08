module Federails
  module Server
    # Controller to render ActivityPub representation of entities configured with Federails::DataEntity
    class PublishedController < Federails::ServerController
      def show
        @publishable = type_scope.find_by!(url_param => params[:id])
        authorize @publishable, policy_class: Federails::Server::PublishablePolicy
      end

      private

      def publishable_config
        return @publishable_config if instance_variable_defined? :@publishable_config

        _, @publishable_config = Federails.configuration.data_types.find { |_, v| v[:route_path_segment].to_s == params[:publishable_type] }
        raise ActiveRecord::RecordNotFound, "Invalid #{params[:publishable_type]} type" unless @publishable_config

        @publishable_config
      end

      def url_param
        publishable_config[:url_param]
      end

      def type_scope
        publishable_config[:class].all
      end
    end
  end
end
