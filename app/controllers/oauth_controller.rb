class OauthController < ApplicationController
  skip_before_action :verify_authenticity_token

  # GET /oauth/client-metadata.json
  # This endpoint serves AT Protocol OAuth client metadata
  # Required for AT Protocol OAuth to work
  def client_metadata
    require 'omniauth-atproto'

    metadata = OmniAuth::Atproto::MetadataGenerator.generate(
      client_id: client_id_url,
      client_name: Rails.application.config.app_name || "Metazine",
      client_uri: root_url.chomp('/'),
      redirect_uri: callback_url,
      scope: "atproto transition:generic",
      client_jwk: OmniAuth::Atproto::KeyManager.current_jwk
    )

    render json: metadata
  end

  private

  def client_id_url
    # The client_id is the URL where this metadata can be fetched
    if Rails.env.development?
      "http://localhost:3000/oauth/client-metadata.json"
    else
      "https://#{ENV['APP_HOST']}/oauth/client-metadata.json"
    end
  end

  def callback_url
    if Rails.env.development?
      "http://localhost:3000/auth/atproto/callback"
    else
      "https://#{ENV['APP_HOST']}/auth/atproto/callback"
    end
  end
end
