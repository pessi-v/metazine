class CreateActorsForExistingUsers < ActiveRecord::Migration[8.0]
  def up
    User.find_each do |user|
      user.create_federails_actor! unless user.federails_actor
    end
  end

  def down
    # Optional: remove actors if you need to roll back
    Federails::Actor.where(actor_type: 'User').destroy_all
  end
end
