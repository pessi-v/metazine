class CreateDiscussions < ActiveRecord::Migration[8.0]
  def change
    create_table :discussions do |t|
      t.timestamps
      t.references :article
      t.references :user
      t.string :federated_url
      t.string :content
    end
  end
end
