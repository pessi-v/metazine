require 'rails_helper'

RSpec.describe Like, type: :model do
  describe 'associations' do
    it 'belongs to an article' do
      like = build(:like, article: nil)
      expect(like).not_to be_valid
    end

    it 'allows optional user and ap_actor' do
      like = build(:like)
      expect(like).to be_valid
    end
  end

  describe 'counter cache' do
    it 'increments and decrements articles.likes_count' do
      article = create(:article)
      expect { create(:like, article: article) }
        .to change { article.reload.likes_count }.by(1)

      like = article.likes.first
      expect { like.destroy }
        .to change { article.reload.likes_count }.by(-1)
    end
  end

  describe 'uniqueness' do
    it 'prevents the same user liking an article twice' do
      article = create(:article)
      user = create(:user)
      create(:like, article: article, user: user)

      dup = build(:like, article: article, user: user)
      expect { dup.save! }.to raise_error(ActiveRecord::RecordNotUnique)
    end

    it 'prevents the same remote actor liking an article twice' do
      article = create(:article)
      url = "https://mastodon.social/users/alice"
      create(:like, article: article, remote_actor_url: url)

      dup = build(:like, article: article, remote_actor_url: url)
      expect { dup.save! }.to raise_error(ActiveRecord::RecordNotUnique)
    end
  end

  describe '#link_to_user_if_exists' do
    it 'links to a local user matching the remote actor url' do
      user = create(:user, username: 'bob', domain: 'mastodon.social')
      article = create(:article)

      like = create(:like, article: article,
        remote_actor_url: "https://mastodon.social/users/bob")

      expect(like.reload.user_id).to eq(user.id)
    end
  end

  describe 'Article#liked_by? and #like_for' do
    it 'detects a like by user' do
      article = create(:article)
      user = create(:user)
      create(:like, article: article, user: user)

      expect(article.liked_by?(user)).to be true
      expect(article.like_for(user)).to be_present
    end

    it 'returns false when not liked' do
      article = create(:article)
      user = create(:user)
      expect(article.liked_by?(user)).to be false
    end
  end

  describe 'federating the article on first like' do
    it 'federates the article when nothing has federated it yet' do
      article = create(:article)
      expect(ActivityPub::FedifyClient).to receive(:create_article).with(article.id)

      create(:like, article: article)

      expect(article.reload.federated_url).to be_present
    end

    it 'does not re-federate an already federated article' do
      article = create(:article, federated_url: "https://example.test/ap/articles/1")
      expect(ActivityPub::FedifyClient).not_to receive(:create_article)

      create(:like, article: article)

      expect(article.reload.federated_url).to eq("https://example.test/ap/articles/1")
    end
  end
end
