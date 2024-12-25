class AddDescriptionLengthToArticles < ActiveRecord::Migration[8.0]
  def change
    add_column :articles, :description_length, :integer
    Article.update_all("description_length = LENGTH(description)") # TODO Use maintenance_tasks gem instead
  end
end
