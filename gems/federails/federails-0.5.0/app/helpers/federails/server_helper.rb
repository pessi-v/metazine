module Federails
  module ServerHelper
    def remote_follow_url
      method_name = Federails.configuration.remote_follow_url_method.to_s
      if method_name.starts_with? 'federails.'
        send(method_name.gsub('federails.', ''))
      else
        Rails.application.routes.url_helpers.send(method_name)
      end
    end
  end
end
