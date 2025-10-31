class MastodonApiClient
  class Error < StandardError; end
  class AuthenticationError < Error; end
  class ApiError < Error; end

  attr_reader :user

  def initialize(user)
    @user = user
    validate_user!
  end

  # Create a comment by posting to the user's Mastodon outbox
  #
  # @param content [String] The comment text
  # @param parent [Article, Comment] The parent object being replied to
  # @return [Hash] Mastodon status response with keys: id, url, uri, created_at
  def create_comment(content:, parent:)
    status_params = build_status_params(content, parent)

    Rails.logger.info "=== MastodonApiClient: Creating status ==="
    Rails.logger.info "  User: #{user.full_username}"
    Rails.logger.info "  Params: #{status_params.inspect}"

    begin
      status = client.create_status(content, status_params)

      Rails.logger.info "  Success! Status ID: #{status.id}"
      Rails.logger.info "  URL: #{status.url}"
      Rails.logger.info "  URI: #{status.uri}"

      {
        id: status.id,
        url: status.url,
        uri: status.uri,
        created_at: status.created_at
      }
    rescue StandardError => e
      Rails.logger.error "  Failed to create status: #{e.class} - #{e.message}"
      raise ApiError, "Failed to create status on Mastodon: #{e.message}"
    end
  end

  # Update a comment by editing the status on user's Mastodon
  #
  # @param status_id [String] The Mastodon status ID
  # @param content [String] The new comment text
  # @return [Hash] Mastodon status response
  def update_comment(status_id:, content:)
    Rails.logger.info "=== MastodonApiClient: Updating status ==="
    Rails.logger.info "  Status ID: #{status_id}"
    Rails.logger.info "  New content: #{content[0..50]}..."

    begin
      # Mastodon API v1/statuses/:id endpoint with PUT method for editing
      status = client.update_status(status_id, content)

      Rails.logger.info "  Success! Updated status #{status.id}"

      {
        id: status.id,
        url: status.url,
        uri: status.uri,
        created_at: status.created_at
      }
    rescue StandardError => e
      Rails.logger.error "  Failed to update status: #{e.class} - #{e.message}"
      raise ApiError, "Failed to update status on Mastodon: #{e.message}"
    end
  end

  # Delete a comment by deleting the status on user's Mastodon
  #
  # @param status_id [String] The Mastodon status ID
  # @return [Boolean] true if successful
  def delete_comment(status_id:)
    Rails.logger.info "=== MastodonApiClient: Deleting status ==="
    Rails.logger.info "  Status ID: #{status_id}"

    begin
      client.destroy_status(status_id)
      Rails.logger.info "  Success! Deleted status #{status_id}"
      true
    rescue StandardError => e
      Rails.logger.error "  Failed to delete status: #{e.class} - #{e.message}"
      raise ApiError, "Failed to delete status on Mastodon: #{e.message}"
    end
  end

  private

  def validate_user!
    raise AuthenticationError, "User must be present" unless user
    raise AuthenticationError, "User must have access_token" unless user.access_token.present?
    raise AuthenticationError, "User must have domain" unless user.domain.present?
  end

  def client
    @client ||= Mastodon::REST::Client.new(
      base_url: "https://#{user.domain}",
      bearer_token: user.access_token
    )
  end

  def build_status_params(content, parent)
    params = {
      visibility: 'public'
    }

    # If parent is a Comment with federated_url, use it as in_reply_to_id
    if parent.is_a?(Comment) && parent.federated_url.present?
      in_reply_to_id = extract_status_id(parent.federated_url)
      if in_reply_to_id
        params[:in_reply_to_id] = in_reply_to_id
        Rails.logger.info "  Replying to status: #{in_reply_to_id}"
      end
    elsif parent.is_a?(Article)
      # For articles, we'll include the article URL in the content
      # and add it as sensitive if needed
      Rails.logger.info "  Commenting on article: #{parent.title}"
      # Note: We could potentially search for the article in user's timeline
      # and use that as in_reply_to_id, but that's complex. For now, just
      # post as top-level and rely on ActivityPub inReplyTo for federation
    end

    params
  end

  # Extract status ID from various Mastodon URL formats
  # Examples:
  #   https://mastodon.social/@user/123456789 -> 123456789
  #   https://mastodon.social/users/user/statuses/123456789 -> 123456789
  #   https://mastodon.social/ap/users/115452228256174584/statuses/115453395430281063 -> 115453395430281063
  def extract_status_id(url)
    return nil unless url.present?

    # Try to match common Mastodon URL patterns
    if url =~ %r{/statuses/(\d+)}
      $1
    elsif url =~ %r{/@[^/]+/(\d+)}
      $1
    else
      Rails.logger.warn "  Could not extract status ID from: #{url}"
      nil
    end
  end
end
