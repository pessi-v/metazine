class Comment < ApplicationRecord
  belongs_to :discussion

  def to_activitypub_object
    Federails::DataTransformer::Note.to_federation(
      self,
      content: content,
      attributedTo: creator.federated_url,
      inReplyTo: parent&.federated_url || discussion.federated_url,
      context: discussion.federated_url
    )
  end
end
