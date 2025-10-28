# This migration comes from federails (originally 20250301082500)
# Table/column already exists - migration content commented out to avoid conflicts
class AddLocalToActors < ActiveRecord::Migration[7.0]
  def change
    # add_column :federails_actors, :local, :boolean, null: false, default: false
    #
    # reversible do |dir|
    # dir.up do
    # exec_update 'UPDATE federails_actors SET local=true WHERE entity_type IS NOT NULL'
    # end
    # end
  end
end
