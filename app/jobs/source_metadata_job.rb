class SourceMetadataJob < ApplicationJob
  queue_as :default

  def perform(source_id)
    source = Source.find_by(id: source_id)
    return unless source

    source.send(:add_description_and_image)
    source.save!
  end
end
