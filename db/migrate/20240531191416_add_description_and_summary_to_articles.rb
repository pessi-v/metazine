# frozen_string_literal: true

class AddDescriptionAndSummaryToArticles < ActiveRecord::Migration[7.1]
  def change
    add_column :articles, :description, :string
    add_column :articles, :summary, :string
  end
end
