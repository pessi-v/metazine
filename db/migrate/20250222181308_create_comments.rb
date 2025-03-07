class CreateComments < ActiveRecord::Migration[8.0]
  def change
    create_table :comments do |t|
      t.timestamps
      t.references :discussion
      t.string :content
      t.bigint :federails_actor_id
      t.references :article
    end
  end
end
