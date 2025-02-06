# frozen_string_literal: true

class AddDescriptionAndImageToSource < ActiveRecord::Migration[7.1]
  def change
    add_column :sources, :description, :string
    add_column :sources, :image_url, :string
  end
end
