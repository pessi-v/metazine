class AddOmniauthFieldsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :provider, :string
    add_column :users, :uid, :string
    add_column :users, :username, :string
    add_column :users, :display_name, :string
    add_column :users, :avatar_url, :string
    add_column :users, :access_token, :string
    add_column :users, :domain, :string

    add_index :users, [:provider, :uid], unique: true
    add_index :users, :username
  end
end
