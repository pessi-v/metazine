class SessionsController < ApplicationController
  allow_unauthenticated_access only: %i[new create failure]
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { redirect_to new_session_url, alert: "Try again later." }

  def new
  end

  # Only handles Mastodon logins for now
  def create
    oauth_info = request.env["omniauth.auth"]

    if oauth_info["extra"]["raw_info"]["uri"]
      federated_url = oauth_info["extra"]["raw_info"]["uri"]
    else
      federated_url = "#{oauth_info['info']['urls']['domain']}/users/#{oauth_info['info']['name']}"
    end

    login_page = request.env["omniauth.origin"]
    federails_actor = Federails::Actor.find_or_create_by_federation_url(federated_url)

    if !federails_actor.entity && !federails_actor.local?
      user = User.create
      federails_actor.update(entity_id: user.id, entity_type: "User")
    else
      user = federails_actor.entity
    end

    if user
      start_new_session_for user
      redirect_to "#{login_page}#discussion"
    else
      redirect_to new_session_path, alert: "Something went wrong."
    end
  end

  def failure
    flash[:alert] = if params[:message] == "access_denied"
      "You cancelled the sign in process. Please try again."
    else
      "There was an issue with the sign in process. Please try again."
    end

    redirect_to new_session_path
  end

  def destroy
    terminate_session
    redirect_back(fallback_location: frontpage_path)
  end
end

# {"provider" => "mastodon",
#   "uid" => "68863",
#   "info" => {"name" => "pes", "nickname" => "pes", "image" => "https://todon.eu/avatars/original/missing.png", "urls" => {"profile" => "https://todon.eu/@pes", "domain" => "https://todon.eu"}},
#   "credentials" => {"token" => "-LgJ0Emk7viDMPkyEU3WRcLPS0XTy4Y0Xg7MMkYAaKg", "expires" => false},
#   "extra" =>
#    {"raw_info" =>
#      {"id" => "68863",
#       "username" => "pes",
#       "acct" => "pes",
#       "display_name" => "pes",
#       "locked" => false,
#       "bot" => false,
#       "discoverable" => false,
#       "indexable" => false,
#       "group" => false,
#       "created_at" => "2021-04-23T00:00:00.000Z",
#       "note" => "",
#       "url" => "https://todon.eu/@pes",
#       "uri" => "https://todon.eu/users/pes",
#       "avatar" => "https://todon.eu/avatars/original/missing.png",
#       "avatar_static" => "https://todon.eu/avatars/original/missing.png",
#       "header" => "https://todon.eu/headers/original/missing.png",
#       "header_static" => "https://todon.eu/headers/original/missing.png",
#       "followers_count" => 0,
#       "following_count" => 7,
#       "statuses_count" => 0,
#       "last_status_at" => nil,
#       "hide_collections" => nil,
#       "noindex" => true,
#       "source" => {"privacy" => "public", "sensitive" => false, "language" => nil, "note" => "", "fields" => [], "follow_requests_count" => 0, "hide_collections" => nil, "discoverable" => false, "indexable" => false},
#       "emojis" => [],
#       "roles" => [],
#       "fields" => [],
#       "role" => {"id" => "-99", "name" => "", "permissions" => "0", "color" => "", "highlighted" => false}}}}
