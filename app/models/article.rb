class Article < ApplicationRecord
  validates :title, :source_name, presence: true
  validates :title, uniqueness: true
end
