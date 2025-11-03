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
      client_uri: base_url,
      redirect_uri: callback_url,
      scope: "atproto transition:generic",
      client_jwk: OmniAuth::Atproto::KeyManager.current_jwk
    )

    render json: metadata
  end

  private

  def base_url
    if Rails.env.development?
      "http://localhost:3000"
    else
      "https://#{ENV['APP_HOST']}"
    end
  end

  def client_id_url
    # The client_id is the URL where this metadata can be fetched
    "#{base_url}/oauth/client-metadata.json"
  end

  def callback_url
    "#{base_url}/auth/atproto/callback"
  end
end
