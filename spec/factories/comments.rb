FactoryBot.define do
  factory :comment do
    content { "This is a comment" }
    association :parent, factory: :article
    association :federails_actor

    trait :deleted do
      deleted_at { Time.current }
      content { "[deleted]" }
    end

    trait :federated do
      sequence(:federated_url) { |n| "https://mastodon.social/users/user/statuses/#{n}" }
    end

    trait :with_replies do
      transient do
        replies_count { 2 }
      end

      after(:create) do |comment, evaluator|
        create_list(:comment, evaluator.replies_count, parent: comment)
      end
    end
  end
end
