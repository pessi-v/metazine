class ApFollow < ApplicationRecord
  enum :status, { pending: 0, accepted: 1 }

  validates :follower_url, presence: true, uniqueness: true
  validates :follower_inbox_url, presence: true
end
