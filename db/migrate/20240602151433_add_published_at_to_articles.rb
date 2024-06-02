class AddPublishedAtToArticles < ActiveRecord::Migration[7.1]
  def change
    add_column :articles, :published_at, :datetime
  end
end
