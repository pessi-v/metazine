FactoryBot.define do
  factory :source do
    sequence(:name) { |n| "Source #{n}" }
    sequence(:url) { |n| "https://example#{n}.com/feed.xml" }
    active { true }
    show_images { true }
    allow_video { true }
    allow_audio { true }
    description { "A great source of news and information" }
    image_url { "https://example.com/image.jpg" }

    trait :inactive do
      active { false }
    end

    trait :with_articles do
      transient do
        articles_count { 3 }
      end

      after(:create) do |source, evaluator|
        create_list(:article, evaluator.articles_count, source: source)
      end
    end
  end
end
