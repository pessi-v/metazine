class AddTagsToArticles < ActiveRecord::Migration[8.0]
  def change
    add_column :articles, :tags, :jsonb
  end
end
