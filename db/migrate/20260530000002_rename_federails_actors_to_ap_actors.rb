class RenameFederailsActorsToApActors < ActiveRecord::Migration[8.0]
  def change
    rename_table :federails_actors, :ap_actors
    rename_column :articles, :federails_actor_id, :ap_actor_id
    rename_column :comments, :federails_actor_id, :ap_actor_id
  end
end
