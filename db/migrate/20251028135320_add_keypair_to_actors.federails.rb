# This migration comes from federails (originally 20241002094501)
# Table/column already exists - migration content commented out to avoid conflicts
class AddKeypairToActors < ActiveRecord::Migration[7.0]
  def change
    # change_table :federails_actors do |t|
    # t.text :public_key
    # t.text :private_key
    # end
  end
end
