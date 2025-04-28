class InstanceActor < ActiveRecord::Migration[8.0]
  def change
    create_table :instance_actors do |t|
      t.timestamps
      t.string :name
    end
  end
end
