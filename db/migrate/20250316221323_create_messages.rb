class CreateMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :messages do |t|
      t.references :discussion
      t.string :content
      t.bigint :federails_actor_id
      t.timestamps
    end
  end
end
