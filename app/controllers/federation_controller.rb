class FederationController < ApplicationController
  def webfinger
    render json: JSON.parse(
      {  
        "subject": "acct:#{ENV.fetch('FEDIVERSE_USER_NAME').gsub('@', '')}@maho.dev",
        "aliases": [
          "#{ENV.fetch('APP_URL')}/@#{ENV.fetch('FEDIVERSE_USER_NAME').gsub('@', '')}"
        ],
        "links": [
          {
            "rel": "self",
            "type": "application/activity+json",
            "href": "#{ENV.fetch('APP_URL')}/@#{ENV.fetch('FEDIVERSE_USER_NAME').gsub('@', '')}"
          },
          {
            "rel":"http://webfinger.net/rel/profile-page",
            "type":"text/html",
            "href":"#{ENV.fetch('APP_URL')}/"
          }
        ]
    }
    )
  end
end
