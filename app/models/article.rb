class Article < ApplicationRecord
  validates :title, :source_name, presence: true
end
