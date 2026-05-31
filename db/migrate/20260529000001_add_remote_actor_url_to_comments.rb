class AddRemoteActorUrlToComments < ActiveRecord::Migration[8.0]
  def change
    add_column :comments, :remote_actor_url, :text
  end
end
