class CreateFederailsActivities < ActiveRecord::Migration[7.0]
  def change
    create_table :federails_activities do |t|
      t.references :entity, polymorphic: true, null: false
      t.string :action, null: false, default: nil
      t.references :actor, null: false, foreign_key: { to_table: :federails_actors }

      t.timestamps
    end
  end
end
