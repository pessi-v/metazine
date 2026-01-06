FactoryBot.define do
  factory :user do
    sequence(:username) { |n| "user#{n}" }
    sequence(:display_name) { |n| "User #{n}" }
    sequence(:uid) { |n| n.to_s }
    provider { "mastodon" }
    domain { "mastodon.social" }
    avatar_url { "https://mastodon.social/avatars/original/missing.png" }
    sequence(:access_token) { |n| "token_#{n}" }

    trait :with_actor do
      after(:create) do |user|
        create(:federails_actor,
          entity_type: 'User',
          entity_id: user.id,
          username: user.username,
          name: user.display_name,
          server: user.domain,
          federated_url: "https://#{user.domain}/users/#{user.username}"
        )
      end
    end
  end
end
