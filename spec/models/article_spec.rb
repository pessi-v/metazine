require 'rails_helper'

RSpec.describe Article, type: :model do
  describe 'associations' do
    it 'belongs to source' do
      article = build(:article)
      expect(article).to respond_to(:source)
    end

    it 'belongs to federails_actor' do
      article = build(:article)
      expect(article).to respond_to(:federails_actor)
    end

    it { is_expected.to have_many(:comments).dependent(:delete_all) }
  end

  describe 'validations' do
    it 'validates presence of title' do
      article = build(:article, title: nil)
      expect(article).not_to be_valid
      expect(article.errors[:title]).to include("can't be blank")
    end

    it 'validates presence of source_name' do
      article = build(:article, source_name: nil)
      expect(article).not_to be_valid
      expect(article.errors[:source_name]).to include("can't be blank")
    end

    it 'validates presence of description' do
      article = build(:article, description: nil)
      expect(article).not_to be_valid
      expect(article.errors[:description]).to include("can't be blank")
    end

    it 'validates uniqueness of title' do
      create(:article, title: 'Unique Title')
      duplicate = build(:article, title: 'Unique Title')
      expect(duplicate).not_to be_valid
    end

    context 'when description is blank' do
      it 'is invalid' do
        article = build(:article, description: '')
        expect(article).not_to be_valid
        expect(article.errors[:description]).to be_present
      end
    end
  end

  describe 'scopes' do
    let!(:today_article) { create(:article, published_at: Time.current) }
    let!(:yesterday_article) { create(:article, published_at: 1.day.ago) }
    let!(:two_days_ago_article) { create(:article, published_at: 2.days.ago) }

    describe '.today' do
      it 'returns articles published today' do
        expect(Article.today).to include(today_article)
        expect(Article.today).not_to include(yesterday_article)
      end
    end

    describe '.yesterday' do
      it 'returns articles published yesterday' do
        expect(Article.yesterday).to include(yesterday_article)
        expect(Article.yesterday).not_to include(today_article)
      end
    end

    describe '.days_ago' do
      it 'returns articles published N days ago' do
        expect(Article.days_ago(2)).to include(two_days_ago_article)
        expect(Article.days_ago(2)).not_to include(today_article)
      end
    end
  end

  describe 'callbacks' do
    describe 'before_save :extract_searchable_content' do
      context 'when readability_output_jsonb has content' do
        let(:article) { build(:article, :with_readability) }

        it 'extracts searchable content from HTML' do
          article.save
          expect(article.searchable_content).to eq('This is the readable content of the article.')
        end

        it 'removes HTML tags from content' do
          article.readability_output_jsonb = {
            "content" => "<h1>Title</h1><p>Paragraph with <strong>bold</strong> text.</p>"
          }
          article.save
          # Note: The extraction collapses whitespace so there may not be a space between Title and Paragraph
          expect(article.searchable_content).to match(/Title.*Paragraph with bold text\./)
        end

        it 'truncates content to 10000 characters' do
          long_content = "<p>#{('a' * 15000)}</p>"
          article.readability_output_jsonb = { "content" => long_content }
          article.save
          expect(article.searchable_content.length).to eq(10000)
        end

        it 'removes script and style tags' do
          article.readability_output_jsonb = {
            "content" => "<p>Content</p><script>alert('hi')</script><style>.red{color:red}</style>"
          }
          article.save
          expect(article.searchable_content).to eq('Content')
        end
      end

      context 'when readability_output_jsonb is blank' do
        let(:article) { build(:article) }

        it 'does not set searchable_content' do
          article.save
          expect(article.searchable_content).to be_nil
        end
      end

      context 'when readability_output_jsonb has not changed' do
        let(:article) { create(:article, :with_readability) }

        it 'does not re-extract if searchable_content exists' do
          original_content = article.searchable_content
          article.title = 'New Title'
          article.save

          expect(article.searchable_content).to eq(original_content)
        end
      end
    end
  end

  describe '.handle_federated_object?' do
    it 'returns true when hash has no inReplyTo' do
      hash = { "type" => "Note", "content" => "Test" }
      expect(Article.handle_federated_object?(hash)).to be true
    end

    it 'returns false when hash has inReplyTo' do
      hash = { "type" => "Note", "content" => "Test", "inReplyTo" => "https://example.com/note/1" }
      expect(Article.handle_federated_object?(hash)).to be false
    end
  end

  describe '#to_activitypub_object' do
    let(:article) { create(:article) }

    it 'returns a hash with ActivityPub Note format' do
      result = article.to_activitypub_object

      expect(result).to be_a(Hash)
      expect(result['type']).to eq('Note')
      expect(result['name']).to eq(article.title)
    end

    it 'includes reader URL in content' do
      result = article.to_activitypub_object
      expect(result['content']).to include('reader')
    end
  end

  describe 'dependent associations' do
    context 'when destroying an article with comments' do
      it 'successfully deletes the article and its comments' do
        article = create(:article, :with_comments, comments_count: 3)

        expect(article.comments.count).to eq(3)
        expect { article.destroy }.not_to raise_error
        expect(Article.exists?(article.id)).to be false
        expect(Comment.where(parent: article)).to be_empty
      end

      it 'bypasses comment soft-delete callbacks when deleting article' do
        article = create(:article)
        comment = create(:comment, parent: article)

        # The comment should be hard-deleted (not soft-deleted) when article is destroyed
        article.destroy

        expect(Comment.exists?(comment.id)).to be false
        # Verify it was actually deleted, not soft-deleted
        expect(Comment.unscoped.find_by(id: comment.id)).to be_nil
      end
    end
  end

  describe 'search' do
    let!(:article1) { create(:article, title: 'Ruby on Rails Tutorial', source_name: 'Tech Blog') }
    let!(:article2) { create(:article, title: 'Python Programming', source_name: 'Code Academy') }
    let!(:article3) do
      create(:article, :with_readability, title: 'JavaScript Guide').tap do |a|
        a.readability_output_jsonb['content'] = '<p>Learn about Ruby programming</p>'
        a.save
      end
    end

    describe '.search_by_title_source_and_readability_output' do
      it 'finds articles by title' do
        results = Article.search_by_title_source_and_readability_output('Ruby')
        expect(results).to include(article1)
        expect(results).not_to include(article2)
      end

      it 'finds articles by source name' do
        results = Article.search_by_title_source_and_readability_output('Tech Blog')
        expect(results).to include(article1)
      end

      it 'finds articles by searchable content' do
        results = Article.search_by_title_source_and_readability_output('Ruby')
        expect(results).to include(article3)
      end

      it 'supports prefix matching' do
        results = Article.search_by_title_source_and_readability_output('Rai')
        expect(results).to include(article1)
      end
    end
  end
end
