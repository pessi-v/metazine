class AddLastBuiltToSources < ActiveRecord::Migration[8.0]
  def change
    add_column :sources, :last_built, :string
  end
end
