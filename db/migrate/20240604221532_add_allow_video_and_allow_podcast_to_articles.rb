class AddAllowVideoAndAllowPodcastToArticles < ActiveRecord::Migration[7.1]
  def change
    add_column :articles, :allow_video, :boolean, default: false
    add_column :articles, :allow_audio, :boolean, default: false
  end
end
