# frozen_string_literal: true

class AddArticlesCountToSources < ActiveRecord::Migration[7.1]
  def change
    add_column :sources, :articles_count, :integer
  end
end
