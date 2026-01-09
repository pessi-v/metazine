class ActivityPub::NoteActivityHandler
  # Handles Create activities for Note objects (comments/replies)
  def self.handle_create_note(activity_hash_or_id)
    activity = Fediverse::Request.dereference(activity_hash_or_id)
    object = Fediverse::Request.dereference(activity["object"])

    Rails.logger.info "=== Received Create Note activity ==="
    Rails.logger.info "  Note ID: #{object['id']}"
    Rails.logger.info "  Note type: #{object['type']}"
    Rails.logger.info "  inReplyTo: #{object['inReplyTo']}"
    Rails.logger.info "  attributedTo: #{object['attributedTo']}"

    # Use federails' built-in mechanism to find or create the entity
    # This will call Comment.from_activitypub_object if it doesn't exist
    entity = Federails::Utils::Object.find_or_create!(object)

    Rails.logger.info "  Created/found entity: #{entity.class.name}##{entity.id}"

    entity
  rescue => e
    Rails.logger.error "=== Error handling Create Note activity ==="
    Rails.logger.error "  Error: #{e.class}: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    raise
  end

  # Handles Update activities for Note objects
  def self.handle_update_note(activity_hash_or_id)
    activity = Fediverse::Request.dereference(activity_hash_or_id)
    object = Fediverse::Request.dereference(activity["object"])

    Rails.logger.info "=== Received Update Note activity ==="
    Rails.logger.info "  Note ID: #{object['id']}"

    # Find the existing entity and update it
    entity = Federails::Utils::Object.find_or_initialize!(object)

    if entity.persisted?
      # Update existing entity - only update content and timestamps, NOT parent
      entity.skip_federails_callbacks = true if entity.respond_to?(:skip_federails_callbacks=)
      entity.content = object["content"] if object["content"]
      entity.updated_at = Time.parse(object["updated"]) if object["updated"]
      entity.save!(touch: false)
      Rails.logger.info "  Updated entity: #{entity.class.name}##{entity.id}"
    else
      # If it doesn't exist, create it
      entity.save!(touch: false)
      Rails.logger.info "  Created entity: #{entity.class.name}##{entity.id}"
    end

    entity
  rescue => e
    Rails.logger.error "=== Error handling Update Note activity ==="
    Rails.logger.error "  Error: #{e.class}: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    raise
  end

  # Handles Delete activities for Note objects
  def self.handle_delete_note(activity_hash_or_id)
    activity = Fediverse::Request.dereference(activity_hash_or_id)

    # The object in a Delete activity can be:
    # 1. A string URL
    # 2. A hash with an "id" field
    # 3. A Tombstone object with an "id" field
    object = activity["object"]
    object_id = case object
                when String
                  object
                when Hash
                  # Handle Tombstone objects or regular objects
                  object["id"]
                else
                  nil
                end

    Rails.logger.info "=== Received Delete Note activity ==="
    Rails.logger.info "  Activity ID: #{activity['id']}"
    Rails.logger.info "  Object ID: #{object_id}"
    Rails.logger.info "  Object type: #{object.is_a?(Hash) ? object['type'] : 'String'}"

    unless object_id
      Rails.logger.error "  Could not extract object ID from Delete activity"
      return nil
    end

    # Find the comment by federated_url
    comment = Comment.find_by(federated_url: object_id)

    if comment
      Rails.logger.info "  Found comment: #{comment.id} (parent: #{comment.parent_type}##{comment.parent_id})"
      comment.skip_federails_callbacks = true

      # Soft delete the comment
      begin
        comment.soft_delete!
        Rails.logger.info "  Successfully soft deleted comment"
      rescue => e
        Rails.logger.error "  Error during soft_delete: #{e.class}: #{e.message}"
        # Try direct update as fallback
        comment.update_columns(deleted_at: Time.current, content: "[deleted]", user_id: nil)
        Rails.logger.info "  Soft deleted via fallback method"
      end
    else
      Rails.logger.warn "  Comment not found for deletion (federated_url: #{object_id})"
      Rails.logger.warn "  This may be normal if the comment was already deleted or never existed locally"
    end

    comment
  rescue => e
    Rails.logger.error "=== Error handling Delete Note activity ==="
    Rails.logger.error "  Error: #{e.class}: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    raise
  end
end
