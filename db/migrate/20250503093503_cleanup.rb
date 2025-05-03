class Cleanup < ActiveRecord::Migration[8.0]
  def change
    remove_column :articles, :summary if column_exists?(:articles, :summary)
    remove_column :articles, :preview_text if column_exists?(:articles, :preview_text)
    remove_column :articles, :readability_output if column_exists?(:articles, :readability_output)

    drop_table :messages if table_exists?(:messages)
    drop_table :users if table_exists?(:users)
    drop_table :federails_instance_actors if table_exists?(:federails_instance_actors)
  end
end
