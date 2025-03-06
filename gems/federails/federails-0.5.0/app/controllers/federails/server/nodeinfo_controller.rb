module Federails
  module Server
    class NodeinfoController < Federails::ServerController
      def index
        skip_authorization

        render formats: [:nodeinfo]
      end

      def show # rubocop:todo Metrics/AbcSize
        skip_authorization

        @total = @active_halfyear = @active_month = 0
        @has_user_counts = false
        Federails::Configuration.actor_types.each_value do |config|
          next unless (method = config[:user_count_method]&.to_sym)

          @has_user_counts = true
          model = config[:class]
          @total += model.send(method, nil)
          @active_month += model.send(method, ((30.days.ago)...Time.current))
          @active_halfyear += model.send(method, ((180.days.ago)...Time.current))
        end
        render formats: [:nodeinfo]
      end
    end
  end
end
