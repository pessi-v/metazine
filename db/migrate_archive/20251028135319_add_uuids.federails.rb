# This migration comes from federails (originally 20241002094500)
# Table/column already exists - migration content commented out to avoid conflicts
class AddUuids < ActiveRecord::Migration[7.0]
  def change
    # [
    # :federails_actors,
    # :federails_activities,
    # :federails_followings,
    # ].each do |table|
    # change_table table do |t|
    # t.string :uuid, default: nil, index: { unique: true }
    # end
    # end
  end
end
