# Configure session cookies for OAuth compatibility
Rails.application.config.session_store :cookie_store,
  key: '_metazine_session',
  same_site: :lax,
  secure: Rails.env.production?,
  domain: :all  # Allow cookies to work across subdomains and the main domain
