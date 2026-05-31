require "net/http"
require "json"

# Delivers outgoing ActivityPub activities via the Fedify sidecar.
# No-ops silently when FEDIFY_INTERNAL_URL is not configured.
module ActivityPub
  class FedifyClient
    FEDIFY_URL    = ENV["FEDIFY_INTERNAL_URL"]
    SECRET        = ENV["INTERNAL_SECRET"]

    def self.create_article(article_id)
      post(type: "CreateArticle", objectId: article_id)
    end

    def self.delete_comment(comment_id)
      post(type: "DeleteComment", objectId: comment_id)
    end

    def self.announce_comment(comment_id:, object_url:)
      post(type: "AnnounceComment", objectId: comment_id, objectUrl: object_url)
    end

    def self.follow_community(community_url)
      post(type: "FollowCommunity", communityUrl: community_url)
    end

    def self.post(payload)
      return unless FEDIFY_URL.present?

      uri = URI.parse("#{FEDIFY_URL}/internal/send-activity")
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == "https"

      req = Net::HTTP::Post.new(uri.path)
      req["Content-Type"]  = "application/json"
      req["Authorization"] = "Bearer #{SECRET}"
      req.body = payload.to_json

      res = http.request(req)
      unless res.is_a?(Net::HTTPSuccess)
        Rails.logger.error "[FedifyClient] HTTP #{res.code}: #{res.body.to_s.truncate(200)}"
      end
    rescue => e
      Rails.logger.error "[FedifyClient] #{e.class}: #{e.message}"
    end
  end
end
