class ActivityPub::NoteActivityHandler
  def self.handle_create_note(activity_json)
    object = extract_object(activity_json)
    return unless object.is_a?(Hash)

    note_id      = object["id"]
    in_reply_to  = Array(object["inReplyTo"]).first
    content      = object["content"] || ""
    actor_url    = extract_actor_url(activity_json)
    published    = parse_time(object["published"])

    Rails.logger.info "=== Received Create Note activity ==="
    Rails.logger.info "  Note ID: #{note_id}"
    Rails.logger.info "  inReplyTo: #{in_reply_to}"
    Rails.logger.info "  actor: #{actor_url}"

    return unless in_reply_to.present?
    return if note_id.present? && Comment.exists?(federated_url: note_id)

    parent = find_parent(in_reply_to)
    unless parent
      Rails.logger.warn "  Could not find parent for inReplyTo: #{in_reply_to}"
      return
    end

    comment = Comment.new(
      content: content,
      parent: parent,
      federated_url: note_id,
      remote_actor_url: actor_url,
      created_at: published || Time.current
    )
    comment.skip_federails_callbacks = true

    if comment.save
      Rails.logger.info "  Created Comment##{comment.id}"
      ActivityPub::AnnounceCommentService.call(comment)
    else
      Rails.logger.error "  Failed to create Comment: #{comment.errors.full_messages.join(', ')}"
    end
  rescue => e
    Rails.logger.error "=== Error handling Create Note: #{e.class}: #{e.message} ==="
    Rails.logger.error e.backtrace.first(5).join("\n")
    raise
  end

  def self.handle_update_note(activity_json)
    object = extract_object(activity_json)
    return unless object.is_a?(Hash)

    note_id = object["id"]
    content = object["content"]

    Rails.logger.info "=== Received Update Note activity: #{note_id} ==="

    comment = Comment.find_by(federated_url: note_id)
    unless comment
      Rails.logger.warn "  Comment not found for update: #{note_id}"
      return
    end

    comment.skip_federails_callbacks = true
    comment.content = content if content.present?
    comment.updated_at = parse_time(object["updated"]) || Time.current
    comment.save!(touch: false)
    Rails.logger.info "  Updated Comment##{comment.id}"
  rescue => e
    Rails.logger.error "=== Error handling Update Note: #{e.class}: #{e.message} ==="
    Rails.logger.error e.backtrace.first(5).join("\n")
    raise
  end

  def self.handle_delete_note(activity_json)
    object = activity_json["object"]
    object_id = object.is_a?(Hash) ? object["id"] : object

    Rails.logger.info "=== Received Delete Note: #{object_id} ==="

    comment = Comment.find_by(federated_url: object_id)
    unless comment
      Rails.logger.warn "  Comment not found for deletion: #{object_id}"
      return
    end

    comment.soft_delete!
    Rails.logger.info "  Soft deleted Comment##{comment.id}"
  rescue => e
    Rails.logger.error "=== Error handling Delete Note: #{e.class}: #{e.message} ==="
    Rails.logger.error e.backtrace.first(5).join("\n")
    raise
  end

  private

  def self.extract_object(activity_json)
    obj = activity_json["object"]
    obj.is_a?(String) ? {"id" => obj} : obj
  end

  def self.extract_actor_url(activity_json)
    actor = activity_json["actor"]
    actor.is_a?(Hash) ? actor["id"] : actor
  end

  def self.find_parent(url)
    Article.find_by(federated_url: url) || Comment.find_by(federated_url: url)
  end

  def self.parse_time(str)
    Time.parse(str) if str.present?
  rescue ArgumentError
    nil
  end
end
