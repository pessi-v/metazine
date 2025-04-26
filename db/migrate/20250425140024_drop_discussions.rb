class DropDiscussions < ActiveRecord::Migration[8.0]
  def up
    drop_table :discussions
  end

  def down
  end
end
