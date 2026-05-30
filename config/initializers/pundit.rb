# Configure Pundit to gracefully handle missing current_user

module Pundit
  module Authorization
    # Override pundit_user to safely return nil if current_user doesn't exist
    def pundit_user
      return nil unless respond_to?(:current_user, true)
      current_user
    rescue NoMethodError
      nil
    end
  end
end
