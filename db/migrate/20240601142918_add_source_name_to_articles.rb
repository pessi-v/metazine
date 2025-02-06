# frozen_string_literal: true

class AddSourceNameToArticles < ActiveRecord::Migration[7.1]
  def change
    add_column :articles, :source_name, :string
  end
end
