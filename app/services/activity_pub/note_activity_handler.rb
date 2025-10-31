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
      # Update existing entity
      attrs = entity.class.from_activitypub_object(object)
      entity.skip_federails_callbacks = true if entity.respond_to?(:skip_federails_callbacks=)
      entity.assign_attributes(attrs)
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

    # The object in a Delete activity is usually just a string URL
    object_id = activity["object"].is_a?(String) ? activity["object"] : activity["object"]["id"]

    Rails.logger.info "=== Received Delete Note activity ==="
    Rails.logger.info "  Object ID: #{object_id}"

    # Find the comment by federated_url
    comment = Comment.find_by(federated_url: object_id)

    if comment
      Rails.logger.info "  Found comment: #{comment.id}"
      comment.skip_federails_callbacks = true
      comment.soft_delete!
      Rails.logger.info "  Soft deleted comment"
    else
      Rails.logger.warn "  Comment not found for deletion"
    end

    comment
  rescue => e
    Rails.logger.error "=== Error handling Delete Note activity ==="
    Rails.logger.error "  Error: #{e.class}: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    raise
  end
end
