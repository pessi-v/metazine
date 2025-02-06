# frozen_string_literal: true

class AddDescriptionLengthToArticles < ActiveRecord::Migration[8.0]
  def change
    add_column :articles, :description_length, :integer
    Article.where.not(description: nil).update_all('description_length = LENGTH(description)') # TODO: Use maintenance_tasks gem instead
    Article.where(description: nil).update_all('description_length = LENGTH(summary)') # TODO: Use maintenance_tasks gem instead
  end
end
