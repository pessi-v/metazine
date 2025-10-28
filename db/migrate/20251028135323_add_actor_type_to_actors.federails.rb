# This migration comes from federails (originally 20250329123939)
# Table/column already exists - migration content commented out to avoid conflicts
class AddActorTypeToActors < ActiveRecord::Migration[7.2]
  def change
    # add_column :federails_actors, :actor_type, :string, null: true
  end
end
