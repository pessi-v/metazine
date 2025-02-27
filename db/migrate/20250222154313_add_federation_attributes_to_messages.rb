class AddFederationAttributesToMessages < ActiveRecord::Migration[8.0]
  def change
    change_column_null :messages, :user_id, true                              # Users are now optional
    add_column :messages, :federated_url, :string, null: true, default: nil   # Required
    add_reference :messages, :federails_actor, null: true, foreign_key: true  # Required
  end
end
