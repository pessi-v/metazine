class DropUnusedFederailsTables < ActiveRecord::Migration[8.0]
  def up
    drop_table :federails_activities
    drop_table :federails_followings
    drop_table :federails_hosts
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
