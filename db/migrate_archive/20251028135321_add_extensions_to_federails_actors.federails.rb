# This migration comes from federails (originally 20250122160618)
# Table/column already exists - migration content commented out to avoid conflicts
class AddExtensionsToFederailsActors < ActiveRecord::Migration[7.1]
  def change
    # add_column :federails_actors, :extensions, :json, default: nil, null: true
  end
end
