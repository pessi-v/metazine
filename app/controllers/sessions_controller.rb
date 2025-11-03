class SessionsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:create, :mastodon, :bluesky]

  # POST /login/mastodon - Initiate Mastodon OAuth
  def mastodon
    puts "\n\n=== SessionsController#mastodon called ==="
    puts "Domain: #{params[:domain]}"

    domain = params[:domain]&.strip&.downcase

    if domain.blank?
      puts "Domain is blank, redirecting back"
      redirect_back fallback_location: frontpage_path, alert: "Please enter your Mastodon instance domain"
      return
    end

    # Store the return URL to redirect back after login
    session[:return_to] = request.referer || root_path

    puts "Redirecting to /auth/mastodon with domain=#{domain}"
    # Redirect to OmniAuth with the domain - the credentials lambda will handle the rest
    redirect_to "/auth/mastodon?domain=#{domain}", allow_other_host: false
  end

  # POST /login/bluesky - Initiate Bluesky/AT Protocol OAuth
  def bluesky
    puts "\n\n=== SessionsController#bluesky called ==="
    puts "Handle: #{params[:handle]}"

    handle = params[:handle]&.strip&.downcase

    if handle.blank?
      puts "Handle is blank, redirecting back"
      redirect_back fallback_location: frontpage_path, alert: "Please enter your Bluesky handle"
      return
    end

    # Store the return URL to redirect back after login
    session[:return_to] = request.referer || root_path

    puts "Redirecting to /auth/atproto with handle=#{handle}"
    # Redirect to OmniAuth with the handle - the strategy will resolve the PDS
    redirect_to "/auth/atproto?handle=#{handle}", allow_other_host: false
  end

  # GET/POST /auth/mastodon/callback - OAuth callback
  def create
    puts "\n=== SessionsController#create (callback) ==="
    auth = request.env["omniauth.auth"]
    origin = request.env["omniauth.origin"]
    puts "Auth present: #{auth.present?}"
    puts "Origin: #{origin}"

    if auth.nil?
      redirect_back fallback_location: frontpage_path, alert: "Authentication failed. Please try again."
      return
    end

    @user = User.from_omniauth(auth)
    Rails.logger.info "=== User from omniauth: #{@user.inspect}, persisted: #{@user.persisted?}"

    if @user.persisted?
      # Create a new session record
      @session = @user.sessions.create!(
        ip_address: request.remote_ip,
        user_agent: request.user_agent
      )
      Rails.logger.info "=== Session created: ID=#{@session.id}, user_id=#{@session.user_id}, persisted=#{@session.persisted?}"

      # Store session ID in signed cookie (more reliable than session hash for OAuth)
      cookies.signed.permanent[:session_id] = {
        value: @session.id,
        httponly: true,
        same_site: :lax,
        secure: Rails.env.production?
      }
      Rails.logger.info "=== Set signed cookie session_id=#{@session.id}"

      # Also store in session hash as backup
      session[:session_id] = @session.id
      session[:user_id] = @user.id

      # Redirect back to where the user was (omniauth stores this in origin)
      return_to = origin || frontpage_path
      puts "Redirecting to: #{return_to}"
      redirect_to return_to, notice: "Successfully logged in as #{@user.full_username}!"
    else
      Rails.logger.error "=== User NOT persisted! Errors: #{@user.errors.full_messages}"
      redirect_back fallback_location: frontpage_path, alert: "Failed to create user account."
    end
  end

  # DELETE /logout
  def destroy
    if current_session
      current_session.destroy
    end

    # Clear both session hash and signed cookie
    reset_session
    cookies.delete(:session_id)
    redirect_back fallback_location: frontpage_path, notice: "Logged out successfully."
  end

  # GET /auth/failure - OAuth failure callback
  def failure
    redirect_back fallback_location: frontpage_path, alert: "Authentication failed: #{params[:message]}"
  end
end
