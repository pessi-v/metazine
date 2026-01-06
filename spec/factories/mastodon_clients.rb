FactoryBot.define do
  factory :mastodon_client do
    sequence(:domain) { |n| "mastodon#{n}.social" }
    sequence(:client_id) { |n| "client_id_#{n}" }
    sequence(:client_secret) { |n| "client_secret_#{n}" }
  end
end
