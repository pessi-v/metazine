FactoryBot.define do
  factory :article do
    sequence(:title) { |n| "Article Title #{n}" }
    description { "This is a description of the article with sufficient content" }
    url { "https://example.com/article" }
    source_name { source&.name || "Default Source" }
    published_at { Time.current }
    image_url { "https://example.com/article-image.jpg" }

    association :source
    association :federails_actor

    trait :with_readability do
      readability_output_jsonb do
        {
          "title" => title,
          "content" => "<p>This is the readable content of the article.</p>",
          "excerpt" => "This is the readable content..."
        }
      end
    end

    trait :paywalled do
      paywalled { true }
    end

    trait :with_tags do
      tags { ["technology", "news", "programming"] }
    end

    trait :federated do
      sequence(:federated_url) { |n| "https://mastodon.social/users/user/statuses/#{n}" }
    end

    trait :with_comments do
      transient do
        comments_count { 2 }
      end

      after(:create) do |article, evaluator|
        create_list(:comment, evaluator.comments_count, parent: article)
      end
    end
  end
end
