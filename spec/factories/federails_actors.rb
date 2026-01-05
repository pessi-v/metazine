FactoryBot.define do
  factory :federails_actor, class: 'Federails::Actor' do
    sequence(:username) { |n| "user#{n}" }
    sequence(:name) { |n| "User #{n}" }
    sequence(:federated_url) { |n| "https://mastodon.social/users/user#{n}" }
    sequence(:inbox_url) { |n| "https://mastodon.social/users/user#{n}/inbox" }
    sequence(:outbox_url) { |n| "https://mastodon.social/users/user#{n}/outbox" }
    sequence(:followers_url) { |n| "https://mastodon.social/users/user#{n}/followers" }
    sequence(:followings_url) { |n| "https://mastodon.social/users/user#{n}/following" }
    sequence(:profile_url) { |n| "https://mastodon.social/@user#{n}" }
    actor_type { "Person" }
    server { "mastodon.social" }
    local { false }

    trait :local do
      local { true }
      server { nil }
      federated_url { nil }
      inbox_url { nil }
      outbox_url { nil }
      followers_url { nil }
      followings_url { nil }
      profile_url { nil }
    end
  end
end
