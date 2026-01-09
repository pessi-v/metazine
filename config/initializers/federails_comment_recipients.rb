# Override federails Activity recipients logic to properly handle comment threading
Rails.application.config.to_prepare do
  Federails::Activity.class_eval do
    # Override recipients method to add custom logic for Comment entities
    def recipients
      case action
      when 'Follow'
        return [] unless actor.local?
        [entity]
      when 'Undo'
        return [] unless actor.local?
        [entity.entity]
      when 'Accept'
        return [] unless actor.local?
        [entity.actor]
      when 'Create', 'Update', 'Delete'
        # Custom logic for Comment entities
        # Comments can be created by remote users logged in via OAuth
        if entity.is_a?(Comment)
          comment_recipients
        else
          # For non-Comment entities, use standard logic (only if actor is local)
          return [] unless actor.local?
          default_recipient_list
        end
      else
        return [] unless actor.local?
        default_recipient_list
      end
    end

    private

    # Determine recipients for comment activities
    # Send to: comment author + parent author + all thread participants
    # Note: Comments are created by remote users (via OAuth), so we don't send to their followers
    # Instead, we send to everyone participating in the thread, INCLUDING the author themselves
    def comment_recipients
      recipients = []
      comment = entity

      # IMPORTANT: Add the comment author's own inbox
      # This allows the comment to appear in their Mastodon timeline/notifications
      if actor.distant?
        recipients << actor
      end

      # Add the parent's author if they're on a remote server
      # This handles both Article parents and Comment parents (replies to federated comments)
      if comment.parent.present? && comment.parent.respond_to?(:federails_actor)
        parent_actor = comment.parent.federails_actor
        if parent_actor&.distant?
          Rails.logger.info "  Adding parent author to recipients: #{parent_actor.username}@#{parent_actor.server}"
          recipients << parent_actor
        end
      end

      # Find the root article by walking up the parent chain
      article = nil
      if comment.parent.is_a?(Article)
        article = comment.parent
      elsif comment.parent.is_a?(Comment)
        # Walk up the comment chain to find the root article
        current = comment.parent
        max_depth = 50 # Prevent infinite loops
        depth = 0
        while current.is_a?(Comment) && current.parent.present? && depth < max_depth
          current = current.parent
          depth += 1
        end
        article = current if current.is_a?(Article)
      end

      # Add all remote actors who have commented on this article (at ANY nesting level)
      if article
        # Get ALL comments under this article, including nested replies
        # We'll recursively collect all comment IDs
        all_comment_ids = []
        comments_to_process = article.comments.pluck(:id)

        while comments_to_process.any?
          all_comment_ids.concat(comments_to_process)
          # Get child comments of the current batch
          comments_to_process = Comment.where(parent_type: 'Comment', parent_id: comments_to_process).pluck(:id)
        end

        # Get all unique actors from these comments
        Comment.where(id: all_comment_ids)
               .includes(:federails_actor)
               .find_each do |other_comment|
          if other_comment.federails_actor&.distant? && other_comment.id != comment.id
            recipients << other_comment.federails_actor
          end
        end
      end

      # Don't add followers since users are remote actors logged in via OAuth
      # Their followers are on their home server, not here

      Rails.logger.info "=== Comment recipients for Activity##{id} ==="
      Rails.logger.info "  Comment: #{comment.id}"
      Rails.logger.info "  Comment author: #{actor.username}@#{actor.server} (local: #{actor.local?})"
      Rails.logger.info "  Recipients: #{recipients.map { |r| "#{r.username}@#{r.server}" }.join(', ')}"
      Rails.logger.info "  Recipient count: #{recipients.uniq.compact.size}"

      recipients.uniq.compact
    end
  end
end
