# This migration comes from federails (originally 20250418093148)
class CreateFederailsInstanceActors < ActiveRecord::Migration[8.0]
  def change
    create_table :federails_instance_actors do |t|
      t.timestamps
      t.string :name
    end
  end

  Federails::InstanceActor.create!(name: "Editor")
end
