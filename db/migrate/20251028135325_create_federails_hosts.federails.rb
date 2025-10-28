# This migration comes from federails (originally 20250426061729)
class CreateFederailsHosts < ActiveRecord::Migration[7.2]
  def change
    create_table :federails_hosts do |t|
      t.string :domain, null: false, default: nil
      t.string :nodeinfo_url
      t.string :software_name
      t.string :software_version

      # PostgreSQL jsonb columns for better performance
      t.jsonb :protocols, default: []
      t.jsonb :services, default: {}

      t.timestamps

      t.index :domain, unique: true
    end
  end
end
