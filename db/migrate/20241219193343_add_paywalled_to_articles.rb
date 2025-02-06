# frozen_string_literal: true

class AddPaywalledToArticles < ActiveRecord::Migration[8.0]
  def change
    add_column :articles, :paywalled, :boolean, default: false
  end
end
