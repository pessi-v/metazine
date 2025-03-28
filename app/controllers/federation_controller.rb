# frozen_string_literal: true

class FederationController < ApplicationController
  include Pagy::Backend

  def webfinger
    render json: JSON.generate(
      {
        "subject": "acct:#{ENV.fetch('FEDIVERSE_USER_NAME').delete('@')}@#{URI.parse(ENV.fetch('APP_URL')).host}",
        # "aliases": [
        #   "#{ENV.fetch('APP_URL')}/@#{ENV.fetch('FEDIVERSE_USER_NAME').gsub('@', '')}"
        # ],
        "links": [
          {
            "rel": 'http://webfinger.net/rel/profile-page',
            "type": 'text/html',
            "href": "#{ENV.fetch('APP_URL')}/"
          },
          {
            "rel": 'self',
            "type": 'application/activity+json',
            "href": fediverse_user_url(ENV.fetch('FEDIVERSE_USER_NAME'))
          }
        ]
      }
    ),
           content_type: 'application/jrd+json'
  end

  # the ActivityPub actor object
  def fediverse_user
    user = params[:fediverse_user]

    render json: JSON.generate(
      {
        "@context": [
          'https://www.w3.org/ns/activitystreams',
          'https://w3id.org/security/v1'
        ],
        "type": 'Person',
        "id": "#{ENV.fetch('APP_URL')}/@#{user}", # THIS NEEDS SOME CHECK FOR IF THIS ACTOR EXISTS, OTHERWISE ANY ACTOR IS AVAILABLE
        "following": "#{ENV.fetch('APP_URL')}/following",
        "followers": "#{ENV.fetch('APP_URL')}/followers",
        "inbox": fediverse_inbox_url(user),
        "outbox": fediverse_outbox_url(user),
        "preferredUsername": ENV.fetch('FEDIVERSE_USER_NAME'),
        "name": ENV.fetch('INSTANCE_NAME'),
        "summary": ENV.fetch('APP_SHORT_DESCRIPTION'),
        "url": ENV.fetch('APP_URL'),
        "discoverable": true, # Mastodon only
        "memorial": false, # Mastodon only: a digital "tombstone"
        "icon": {
          "type": 'Image',
          "mediaType": 'image/jpg',
          "url": "#{ENV.fetch('APP_URL')}/waves.jpg"
        },
        "image": {
          "type": 'Image',
          "mediaType": 'image/jpg',
          "url": "#{ENV.fetch('APP_URL')}/waves.jpg"
        },
        "publicKey": {
          "id": "#{ENV.fetch('APP_URL')}/@#{ENV.fetch('FEDIVERSE_USER_NAME').delete('@')}#main-key",
          "owner": "#{ENV.fetch('APP_URL')}/@#{ENV.fetch('FEDIVERSE_USER_NAME').delete('@')}",
          "publicKeyPem": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApU4KwPCuv7e59f2Bc0Nj\nnEOF+Zhd9rx6oeg36K2hSRExPVG14b2RgW5+9wHB7JoW2BC6zO21M3llMsisV147\nd2lSiOTFqJymq72E3XhvquDKLk/2vJ8ynPIPRnn+CDJd+lQPmnqH/BaKfi4lfUwr\nUMTGkaXZTStSSYSyyq2n5NC1jweZmJyYJZJ14fGc20fGwzkp7Ve3d65bBDcgfAUo\nv1Q8QXgIdsN92ELJbtJ65RTWY9hHS0e1vvy8aY9V9XK+u3Y/Apn8dSm1hhgLkdxU\n52K/b4Qm5ZYolyoH1QrnLhCyHwM8Vpvt4O0iSuIap47MPQv8a4HZQp41ybFXGTCB\nhQIDAQAB\n-----END PUBLIC KEY-----"
        }
      }
    ), content_type: 'application/activity+json'
  end

  def following
    render json: JSON.generate(
      {
        "@context": 'https://www.w3.org/ns/activitystreams',
        "id": "#{ENV.fetch('APP_URL')}/following",
        "type": 'OrderedCollection',
        "totalItems": 1,
        "first": "#{ENV.fetch('APP_URL')}/following_accts"
      }
    ), content_type: 'application/activity+json'
  end

  def followers
    render json: JSON.generate(
      {
        "@context": 'https://www.w3.org/ns/activitystreams',
        "id": "#{ENV.fetch('APP_URL')}/followers",
        "type": 'OrderedCollection',
        "totalItems": 1_000_000,
        "first": "#{ENV.fetch('APP_URL')}/follower_accts"
      }
    ), content_type: 'application/activity+json'
  end

  def outbox
    # user = params[:fediverse_user]

    # fetched_articles = Article.where.not(readability_output: nil)

    # render json: JSON.generate(
    #   {
    #     "@context": "https://www.w3.org/ns/activitystreams",
    #     "id": "#{ENV.fetch('APP_URL')}/@#{user}/outbox",
    #     "type": "OrderedCollection",
    #     "summary": ENV.fetch('APP_SHORT_DESCRIPTION'),
    #     "totalItems": fetched_articles.count,
    #     "orderedItems": fetched_articles.map { |a| a.fedi_activity_and_object }
    #   }), content_type: 'application/activity+json'
    user = params[:fediverse_user]
    @pagy, @articles = pagy(Article.where.not(readability_output: nil))

    # fetched_articles = Article.where.not(readability_output: nil)

    render json: JSON.generate(
      {
        "@context": 'https://www.w3.org/ns/activitystreams',
        "id": "#{ENV.fetch('APP_URL')}/@#{user}/outbox",
        "type": 'OrderedCollection',
        "summary": ENV.fetch('APP_SHORT_DESCRIPTION'),
        "totalItems": Article.where.not(readability_output: nil).count,
        # "orderedItems": fetched_articles.map { |a| a.fedi_activity_and_object }
        "first": {
          "type": 'OrderedCollectionPage',
          "id": "#{ENV.fetch('APP_URL')}/@#{user}/outbox?page=1",
          "partOf": "#{ENV.fetch('APP_URL')}/@#{user}/outbox",
          "next": "#{ENV.fetch('APP_URL')}/@#{user}/outbox?page=2",
          "items": @articles.map(&:fedi_activity_and_object)
        }
      }
    ), content_type: 'application/activity+json'
  end

  def inbox
    params[:fediverse_user]
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
