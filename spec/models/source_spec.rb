require 'rails_helper'

RSpec.describe Source, type: :model do
  describe 'associations' do
    it { is_expected.to have_many(:articles).dependent(:destroy) }
  end

  describe 'validations' do
    it 'validates presence of name' do
      # Skip the before_create callback by using the validator directly
      expect(Source.validators_on(:name).map(&:class)).to include(ActiveRecord::Validations::PresenceValidator)
    end

    it 'validates presence of url' do
      source = Source.new(name: 'Test Source', url: nil)
      expect(source).not_to be_valid
      expect(source.errors[:url]).to include("can't be blank")
    end

    it 'validates uniqueness of name' do
      create(:source, name: 'Unique Name')
      duplicate = build(:source, name: 'Unique Name')
      expect(duplicate).not_to be_valid
    end

    it 'validates uniqueness of url' do
      create(:source, url: 'https://unique.com/feed.xml')
      duplicate = build(:source, url: 'https://unique.com/feed.xml')
      expect(duplicate).not_to be_valid
    end

    context 'when name is a reserved keyword' do
      it 'is invalid' do
        source = build(:source, name: 'articles')
        expect(source).not_to be_valid
        expect(source.errors[:name]).to include('articles is a reserved keyword')
      end
    end

    context 'when name is not a reserved keyword' do
      it 'is valid' do
        source = build(:source, name: 'My Blog')
        expect(source).to be_valid
      end
    end
  end

  describe 'scopes' do
    describe '.active' do
      let!(:active_source) { create(:source, active: true) }
      let!(:inactive_source) { create(:source, :inactive) }

      it 'returns only active sources' do
        expect(Source.active).to include(active_source)
        expect(Source.active).not_to include(inactive_source)
      end
    end
  end

  describe 'callbacks' do
    describe 'before_create :add_description_and_image' do
      it 'is called before creation' do
        source = build(:source)
        expect(source).to receive(:add_description_and_image)
        source.save
      end
    end

    describe 'after_update :update_articles_source_name' do
      let(:source) { create(:source, :with_articles, articles_count: 2) }

      it 'updates all articles source_name when source name changes' do
        old_name = source.name
        new_name = 'New Source Name'

        source.update(name: new_name)

        source.articles.reload.each do |article|
          expect(article.source_name).to eq(new_name)
          expect(article.source_name).not_to eq(old_name)
        end
      end

      it 'does not update articles when other attributes change' do
        original_names = source.articles.map(&:source_name)

        source.update(description: 'New description')

        source.articles.reload.each_with_index do |article, index|
          expect(article.source_name).to eq(original_names[index])
        end
      end
    end
  end

  describe '#reset_articles' do
    let(:source) { create(:source, :with_articles, articles_count: 3) }

    before do
      source.update(last_modified: Time.current, etag: 'abc123', last_built: Time.current)
    end

    it 'destroys all articles' do
      expect {
        allow_any_instance_of(Sources::FeedFetcher).to receive(:consume)
        source.reset_articles
      }.to change { source.articles.count }.from(3).to(0)
    end

    it 'resets last_modified, etag, and last_built' do
      allow_any_instance_of(Sources::FeedFetcher).to receive(:consume)
      source.reset_articles
      source.reload

      expect(source.last_modified).to be_nil
      expect(source.etag).to be_nil
      expect(source.last_built).to be_nil
    end

    it 'calls consume_feed' do
      feed_fetcher = instance_double(Sources::FeedFetcher)
      allow(Sources::FeedFetcher).to receive(:new).and_return(feed_fetcher)
      expect(feed_fetcher).to receive(:consume).with(source)

      source.reset_articles
    end
  end

  describe '#consume_feed' do
    let(:source) { create(:source) }

    it 'calls Sources::FeedFetcher#consume with self' do
      feed_fetcher = instance_double(Sources::FeedFetcher)
      allow(Sources::FeedFetcher).to receive(:new).and_return(feed_fetcher)
      expect(feed_fetcher).to receive(:consume).with(source)

      source.consume_feed
    end
  end

  describe '.consume_all' do
    it 'calls Sources::FeedFetcher#consume_all' do
      feed_fetcher = instance_double(Sources::FeedFetcher)
      allow(Sources::FeedFetcher).to receive(:new).and_return(feed_fetcher)
      expect(feed_fetcher).to receive(:consume_all)

      Source.consume_all
    end
  end

  describe 'dependent associations' do
    context 'when destroying a source with articles that have comments' do
      it 'successfully deletes the source, articles, and comments' do
        source = create(:source, :with_articles, articles_count: 2)
        article1 = source.articles.first
        article2 = source.articles.second

        # Add comments to the articles
        comment1 = create(:comment, parent: article1)
        comment2 = create(:comment, parent: article1)
        comment3 = create(:comment, parent: article2)

        expect(source.articles.count).to eq(2)
        expect(Comment.where(parent: [article1, article2]).count).to eq(3)

        # This should not raise an error (regression test for the bug)
        expect { source.destroy }.not_to raise_error

        # Verify everything was deleted
        expect(Source.exists?(source.id)).to be false
        expect(Article.exists?(article1.id)).to be false
        expect(Article.exists?(article2.id)).to be false
        expect(Comment.exists?(comment1.id)).to be false
        expect(Comment.exists?(comment2.id)).to be false
        expect(Comment.exists?(comment3.id)).to be false
      end
    end
  end
end
