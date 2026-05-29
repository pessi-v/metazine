class InstanceActor < ApplicationRecord
  validates :name, presence: true
  validate :only_one_instance_actor, on: :create

  private

  def only_one_instance_actor
    errors.add(:base, "Only one InstanceActor record is allowed") if InstanceActor.exists?
  end
end
