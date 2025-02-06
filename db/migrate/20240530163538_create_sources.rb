# frozen_string_literal: true

class CreateSources < ActiveRecord::Migration[7.1]
  def change
    create_table :sources do |t|
      t.string :name
      t.string :url
      t.string :last_modified
      t.string :etag
      t.boolean :active
      t.boolean :show_images
      t.string :last_error_status

      t.timestamps
    end
  end
end
