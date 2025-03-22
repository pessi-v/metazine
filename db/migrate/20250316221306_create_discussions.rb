class CreateDiscussions < ActiveRecord::Migration[8.0]
  def change
    create_table :discussions do |t|
      t.references :article
      t.references :user, null: true
      t.references :federails_actor, null: true, foreign_key: true
      t.string :federated_url, null: true, default: nil
      t.string :content
      t.timestamps
    end
  end
end
