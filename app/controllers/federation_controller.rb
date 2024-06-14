class FederationController < ApplicationController
  def webfinger
    render json: JSON.generate(
      {  
        "subject": "acct:#{ENV.fetch('FEDIVERSE_USER_NAME').gsub('@', '')}@#{URI.parse(ENV.fetch('APP_URL')).host}",
        "aliases": [
          "#{ENV.fetch('APP_URL')}/@#{ENV.fetch('FEDIVERSE_USER_NAME').gsub('@', '')}"
        ],
        "links": [
          {
            "rel": "self",
            "type": "application/activity+json",
            "href": fediverse_user_url
          },
          # {
          #   "rel":"http://webfinger.net/rel/profile-page",
          #   "type":"text/html",
          #   "href":"#{ENV.fetch('APP_URL')}/"
          # }
        ]
    }), 
      content_type: 'application/jrd+json'
  end

  def fediverse_user

    render json: JSON.generate(
      {
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": "#{ENV.fetch('APP_URL')}/@#{ENV.fetch('FEDIVERSE_USER_NAME').gsub('@', '')}",
        "type": "Application",
        "following": "#{ENV.fetch('APP_URL')}/following",
        "followers": "#{ENV.fetch('APP_URL')}/followers",
        "inbox": fediverse_inbox_url,
        "outbox": "#{ENV.fetch('APP_URL')}/outbox",
        "preferredUsername": ENV.fetch('FEDIVERSE_USER_NAME'),
        "name": ENV.fetch('APP_NAME'),
        "summary": ENV.fetch('APP_SHORT_DESCRIPTION'),
        "url": ENV.fetch('APP_URL'),
        "discoverable": true, # Mastodon only
        "memorial": false, # Mastodon only: a digital "tombstone"
        "icon": {
          "type": "Image",
          "mediaType": "image/png",
          "url": "#{ENV.fetch('APP_URL')}/waves.jpg"
        },
        "image": {
          "type": "Image",
          "mediaType": "image/png",
          "url": "#{ENV.fetch('APP_URL')}/waves.jpg"
        },
        "publicKey": {
          "@context": "https://w3id.org/security/v1",
          "@type": "Key",
          "id": "#{ENV.fetch('APP_URL')}/@#{ENV.fetch('FEDIVERSE_USER_NAME').gsub('@', '')}#main-key",
          "owner": "#{ENV.fetch('APP_URL')}/@#{ENV.fetch('FEDIVERSE_USER_NAME').gsub('@', '')}",
          "publicKeyPem": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApU4KwPCuv7e59f2Bc0Nj\nnEOF+Zhd9rx6oeg36K2hSRExPVG14b2RgW5+9wHB7JoW2BC6zO21M3llMsisV147\nd2lSiOTFqJymq72E3XhvquDKLk/2vJ8ynPIPRnn+CDJd+lQPmnqH/BaKfi4lfUwr\nUMTGkaXZTStSSYSyyq2n5NC1jweZmJyYJZJ14fGc20fGwzkp7Ve3d65bBDcgfAUo\nv1Q8QXgIdsN92ELJbtJ65RTWY9hHS0e1vvy8aY9V9XK+u3Y/Apn8dSm1hhgLkdxU\n52K/b4Qm5ZYolyoH1QrnLhCyHwM8Vpvt4O0iSuIap47MPQv8a4HZQp41ybFXGTCB\nhQIDAQAB\n-----END PUBLIC KEY-----"
        }
        # "attachment": [
        #   {
        #     "type": "PropertyValue",
        #     "name": "Blog",
        #     "value": "<a href=\"https://maho.dev\" target=\"_blank\" rel=\"nofollow noopener noreferrer me\" translate=\"no\"><span class=\"invisible\">https://</span><span class=\"\">maho.dev</span><span class=\"invisible\"></span></a>"
        #   },
        #   {
        #     "type": "PropertyValue",
        #     "name": "LinkedIn",
        #     "value": "<a href=\"https://www.linkedin.com/in/mahomedalid\" target=\"_blank\" rel=\"nofollow noopener noreferrer me\" translate=\"no\"><span class=\"invisible\">https://www.</span><span class=\"\">linkedin.com/in/mahomedalid</span><span class
    
    # =\"invisible\"></span></a>"
    #       },
    #       {
    #         "type": "PropertyValue",
    #         "name": "GitHub",
    #         "value": "<a href=\"https://github.com/mahomedalid\" target=\"_blank\" rel=\"nofollow noopener noreferrer me\" translate=\"no\"><span class=\"invisible\">https://</span><span class=\"\">github.com/mahomedalid</span><span class=\"invisible\"></span></a>"
    #       }
    #     ]
    }), content_type: 'application/activity+json'
  end

  def outbox
    response.headers['Access-Control-Allow-Origin'] = "*"
    
    render json: JSON.generate(
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "#{ENV.fetch('APP_URL')}/outbox",
      "type": "OrderedCollection",
      "summary": ENV.fetch('APP_SHORT_DESCRIPTION'),
      "totalItems": 0,
      "orderedItems": []
    }), content_type: 'application/activity+json'
  end

  def inbox
    # Parse the incoming ActivityPub request.
    # activity = ActivityPub::Activity.from_h(params.require(:activity).permit!)

    # # Process the incoming activity.
    # case activity.type
    # when "Create"
    #   # Handle the creation of a new activity.
    # when "Follow"
    #   # Handle a new follow request.
    # end

    # # Respond to the request.
    head :created
  end
end
