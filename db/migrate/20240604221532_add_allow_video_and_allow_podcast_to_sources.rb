# frozen_string_literal: true

class AddAllowVideoAndAllowPodcastToSources < ActiveRecord::Migration[7.1]
  def change
    add_column :sources, :allow_video, :boolean, default: false
    add_column :sources, :allow_audio, :boolean, default: false
  end
end
