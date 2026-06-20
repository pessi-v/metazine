require 'rails_helper'

RSpec.describe ActivityPub::LikeActivityHandler do
  let(:article) { create(:article, federated_url: "https://metazine.test/ap/articles/1") }
  let(:actor_url) { "https://mastodon.social/users/alice" }
  let(:like_id) { "https://mastodon.social/users/alice/likes/99" }

  def like_json
    {
      "id" => like_id,
      "type" => "Like",
      "actor" => actor_url,
      "object" => article.federated_url
    }
  end

  describe '.handle_like' do
    it 'creates a Like for the article' do
      expect { described_class.handle_like(like_json) }
        .to change { article.reload.likes_count }.by(1)

      like = article.likes.last
      expect(like.remote_actor_url).to eq(actor_url)
      expect(like.federated_url).to eq(like_id)
    end

    it 'ignores a Like for an unknown article' do
      json = like_json.merge("object" => "https://metazine.test/ap/articles/999")
      expect { described_class.handle_like(json) }.not_to change(Like, :count)
    end

    it 'dedupes against an existing like by the same actor and backfills federated_url' do
      existing = create(:like, article: article, remote_actor_url: actor_url, federated_url: nil)

      expect { described_class.handle_like(like_json) }.not_to change(Like, :count)
      expect(existing.reload.federated_url).to eq(like_id)
    end
  end

  describe '.handle_undo_like' do
    it 'removes a Like matched by federated_url' do
      create(:like, article: article, remote_actor_url: actor_url, federated_url: like_id)

      expect { described_class.handle_undo_like(like_json) }
        .to change { article.reload.likes_count }.by(-1)
    end

    it 'removes a Like matched by article + actor when no federated_url match' do
      create(:like, article: article, remote_actor_url: actor_url, federated_url: nil)

      json = like_json.merge("id" => "https://mastodon.social/other")
      expect { described_class.handle_undo_like(json) }
        .to change(Like, :count).by(-1)
    end

    it 'does nothing when no matching Like exists' do
      expect { described_class.handle_undo_like(like_json) }.not_to change(Like, :count)
    end
  end
end
