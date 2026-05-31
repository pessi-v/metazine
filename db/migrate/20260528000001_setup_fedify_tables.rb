class SetupFedifyTables < ActiveRecord::Migration[8.0]
  def up
    add_column :instance_actors, :public_key, :text
    add_column :instance_actors, :private_key, :text

    create_table :ap_follows do |t|
      t.text :follower_url, null: false
      t.text :follower_inbox_url, null: false
      t.integer :status, null: false, default: 0
      t.text :follow_activity_url
      t.timestamps
    end
    add_index :ap_follows, :follower_url, unique: true

    # Copy keys from federails_actors where they were stored by Federails
    execute <<~SQL
      UPDATE instance_actors ia
      SET public_key  = fa.public_key,
          private_key = fa.private_key
      FROM federails_actors fa
      WHERE fa.entity_type = 'InstanceActor'
        AND fa.entity_id   = ia.id
    SQL
  end

  def down
    remove_column :instance_actors, :public_key
    remove_column :instance_actors, :private_key
    drop_table :ap_follows
  end
end
