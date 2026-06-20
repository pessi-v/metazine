FactoryBot.define do
  factory :like do
    association :article

    trait :by_user do
      association :user
    end

    trait :federated do
      association :ap_actor
      sequence(:federated_url) { |n| "https://mastodon.social/users/user/likes/#{n}" }
      sequence(:remote_actor_url) { |n| "https://mastodon.social/users/user#{n}" }
    end
  end
end
