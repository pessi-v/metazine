class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      # t.string :email_address, null: false
      # t.string :password_digest, null: false
      # t.string :name, null: false
      # t.string :mastodon_domain, null: false
      # t.integer :mastodon_uid, null: false
      # t.references :federails_actor, null: false, foreign_key: true

      t.timestamps
    end
    # add_index :users, :email_address, unique: true
  end
end
