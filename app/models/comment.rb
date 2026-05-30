class Comment < ApplicationRecord
  belongs_to :parent, polymorphic: true
  belongs_to :user, optional: true
  belongs_to :ap_actor, optional: true, class_name: "ApActor"
  has_many :comments, dependent: :destroy, as: :parent

  validates :content, presence: true, allow_blank: false
  validates :parent_type, :parent_id, presence: true, allow_blank: false

  attr_accessor :skip_ap_callbacks

  after_create :link_to_user_if_exists
  after_create :federate_parent_article_on_first_comment

  validate :cannot_edit_deleted_comment, on: :update
  before_save :prevent_parent_reassignment, if: :persisted?

  def cannot_edit_deleted_comment
    if deleted_at_was.present? && !deleted_at_changed?
      errors.add(:base, "Cannot edit a deleted comment")
    end
  end

  def prevent_parent_reassignment
    if parent_type_changed? || parent_id_changed?
      self.parent_type = parent_type_was
      self.parent_id = parent_id_was
      Rails.logger.warn "Prevented parent reassignment on Comment##{id}"
    end
  end

  def federated_url
    read_attribute(:federated_url)
  end

  def assign_attributes(new_attributes)
    return super if new_attributes.blank?
    valid_attributes = new_attributes.select { |key, _|
      self.class.column_names.include?(key.to_s) || respond_to?("#{key}=")
    }
    if valid_attributes.size != new_attributes.size
      filtered = new_attributes.keys - valid_attributes.keys
      Rails.logger.warn "Filtered out invalid attributes for Comment: #{filtered.inspect}"
    end
    super(valid_attributes)
  end

  scope :top_level_comments, -> { where parent_id: nil }
  scope :local_comments, -> { where(federated_url: nil) }
  scope :federated_comments, -> { where.not(federated_url: nil) }
  scope :active, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }

  def destroy
    return false if deleted?

    if federate?
      begin
        ActivityPub::FedifyClient.delete_comment(id)
      rescue => e
        Rails.logger.error "Error queuing Delete activity for Comment##{id}: #{e.message}"
      end
    end

    update_columns(deleted_at: Time.current, content: "[deleted]", user_id: nil)
    Rails.logger.info "Soft deleted Comment##{id}"
    self
  end

  def soft_delete!
    update_columns(deleted_at: Time.current, content: "[deleted]", user_id: nil)
  end

  def deleted?
    deleted_at.present?
  end

  def local?
    federated_url.blank?
  end

  def federated?
    federated_url.present?
  end

  def federate?
    return false if skip_ap_callbacks
    url = read_attribute(:federated_url)
    return false if url.present? && url.include?("mastodon")
    true
  end

  def author_name
    return user.name if user.present?
    return ap_actor.name if ap_actor&.name.present?
    remote_actor_username || "Anonymous"
  end

  def author_username
    return user.full_username if user.present?
    if ap_actor&.username.present? && ap_actor&.server.present?
      return "@#{ap_actor.username}@#{ap_actor.server}"
    end
    remote_actor_url.present? ? remote_actor_url : "unknown"
  end

  def owned_by?(user)
    return false unless user
    return true if user_id == user.id
    return true if ap_actor && user.ap_actor &&
      ap_actor.id == user.ap_actor.id
    false
  end

  def mastodon_status_id
    return nil unless federated_url.present?
    if federated_url =~ %r{/statuses/(\d+)}
      $1
    elsif federated_url =~ %r{/@[^/]+/(\d+)}
      $1
    end
  end

  def depth
    return 0 if parent.is_a?(Article)
    depth = 0
    current = self
    max_depth = 50
    while current.parent.is_a?(Comment) && depth < max_depth
      depth += 1
      current = current.parent
    end
    depth
  end

  private

  def remote_actor_username
    return nil unless remote_actor_url.present?
    uri = URI.parse(remote_actor_url)
    uri.path.split('/').reject(&:empty?).last
  rescue URI::InvalidURIError
    nil
  end

  def link_to_user_if_exists
    return if user_id.present?
    return unless ap_actor

    if ap_actor.entity_type == "User" && ap_actor.entity_id
      update_column(:user_id, ap_actor.entity_id)
    end
  end

  def federate_parent_article_on_first_comment
    return unless parent.is_a?(Article)
    return if parent.federated_url.present?

    return unless parent.comments.count == 1

    host = ENV["APP_HOST"] || Rails.application.routes.default_url_options[:host] || "localhost:3000"
    article_url = "https://#{host}/ap/articles/#{parent.id}"
    parent.update_column(:federated_url, article_url)

    ActivityPub::FedifyClient.create_article(parent.id)
  rescue => e
    Rails.logger.error "=== Error federating parent Article: #{e.class}: #{e.message} ==="
    Rails.logger.error e.backtrace.first(5).join("\n")
  end
end
