class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  # allow_browser versions: :modern

  include Pagy::Backend

  helper_method :current_user, :logged_in?, :current_session

  private

  # Returns the currently logged in user (if any)
  def current_user
    return @current_user if defined?(@current_user)

    @current_user = current_session&.user
  end

  # Returns the current session
  def current_session
    return @current_session if defined?(@current_session)

    # Try signed cookie first (more reliable for OAuth), then fall back to session hash
    session_id = cookies.signed[:session_id] || session[:session_id]
    Rails.logger.info "=== current_session lookup: session_id=#{session_id.inspect}"
    @current_session = Session.find_by(id: session_id) if session_id
    Rails.logger.info "=== current_session result: #{@current_session.inspect}"
    @current_session
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
