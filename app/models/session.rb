class Session < ApplicationRecord
  belongs_to :user

  validates :user_id, presence: true

  before_create do
    self.user_agent = user_agent&.truncate(255) if user_agent
  end
end
