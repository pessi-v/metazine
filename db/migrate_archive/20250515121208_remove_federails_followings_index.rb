class RemoveFederailsFollowingsIndex < ActiveRecord::Migration[8.0]
  def change
    remove_index :federails_followings, name: "index_federails_followings_on_actor_id", column: :actor_id
  end
end
