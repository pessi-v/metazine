class AddSourceIdToArticles < ActiveRecord::Migration[7.1]
  def change
    add_column :articles, :source_id, :integer
  end
end
