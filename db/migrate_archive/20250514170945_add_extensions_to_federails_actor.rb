class AddExtensionsToFederailsActor < ActiveRecord::Migration[8.0]
  def change
    unless column_exists?(:federails_actors, :extensions)
      add_column :federails_actors, :extensions, :json
    end
  end
end
