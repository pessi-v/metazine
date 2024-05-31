class CreateArticles < ActiveRecord::Migration[7.1]
  def change
    create_table :articles do |t|
      t.string :title
      t.string :image_url
      t.string :url
      t.string :preview_text

      t.timestamps
    end
  end
end
