class Message < ApplicationRecord
  belongs_to :discussion, optional: false
  has_one :article, through: :discussion
end
