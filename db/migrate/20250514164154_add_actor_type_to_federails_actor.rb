class AddActorTypeToFederailsActor < ActiveRecord::Migration[8.0]
  def change
    unless column_exists?(:federails_actors, :actor_type)
      add_column :federails_actors, :actor_type, :string
    end
  end
end
