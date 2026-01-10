class CreateJobRuns < ActiveRecord::Migration[8.0]
  def change
    create_table :job_runs do |t|
      t.string :job_name
      t.datetime :started_at
      t.datetime :finished_at
      t.boolean :success
      t.text :error_message

      t.timestamps
    end

    add_index :job_runs, [:job_name, :started_at]
  end
end
