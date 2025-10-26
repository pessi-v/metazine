class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
  include Pagy::Backend

  helper_method :current_user, :logged_in?, :current_session

  private

  # Returns the currently logged in user (if any)
  def current_user
    return @current_user if defined?(@current_user)

    @current_user = if session[:user_id]
      User.find_by(id: session[:user_id])
    end
  end

  # Returns the current session
  def current_session
    return @current_session if defined?(@current_session)

    @current_session = if session[:session_id]
      Session.find_by(id: session[:session_id])
    end
  end

  # Returns true if the user is logged in
  def logged_in?
    current_user.present?
  end

  # Require user to be logged in
  def require_login
    unless logged_in?
      redirect_back fallback_location: frontpage_path, alert: "You must be logged in to access this page."
    end
  end
end
