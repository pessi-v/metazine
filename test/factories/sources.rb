# frozen_string_literal: true

FactoryBot.define do
  factory :source do
    sequence(:name) { |n| "Source #{n}" }
    url { 'https://example.com/feed' }

    trait :active do
      active { true }
    end

    trait :inactive do
      active { false }
    end
  end
end
