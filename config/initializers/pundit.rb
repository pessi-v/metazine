# Configure Pundit to gracefully handle missing current_user
# This is needed for federails controllers which don't have sessions

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
