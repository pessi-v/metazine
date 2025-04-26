class CreateComments < ActiveRecord::Migration[8.0]
  def change
    create_table :comments do |t|
      t.text :content, null: false, default: nil
      t.string :parent_type, null: false
      t.integer :parent_id, null: false
      t.index ["parent_type", "parent_id"], name: "index_poly_comments_on_parent"

      t.timestamps
    end
  end
end
