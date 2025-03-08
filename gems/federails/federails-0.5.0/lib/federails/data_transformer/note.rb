module Federails
  module DataTransformer
    module Note
      # Renders a Note. The entity is used to determine actor and generic fields data
      #
      # @param entity [#federail_actor] A model instance
      # @param content [String] Note content
      # @param name [String, nil] Optional name/title
      # @param custom [Hash] Optional additional keys (e.g.: attachment, icon, ...). Defaults will override these.
      #
      # @return [Hash]
      #
      # @example
      #   Federails::DataTransformer::Note.to_federation(comment, content: comment.content, custom: { 'inReplyTo' => comment.parent.federated_url })
      #
      # See:
      #   - https://www.w3.org/TR/activitystreams-vocabulary/#dfn-object
      #   - https://www.w3.org/TR/activitystreams-vocabulary/#dfn-note
      def self.to_federation(entity, content:, name: nil, custom: {})
        custom.merge '@context'     => 'https://www.w3.org/ns/activitystreams',
                     'id'           => entity.federated_url,
                     'type'         => 'Note',
                     'name'         => name,
                     'content'      => content,
                     'attributedTo' => entity.federails_actor.federated_url,
                     'published'    => entity.created_at,
                     'updated'      => entity.updated_at
      end
    end
  end
end
