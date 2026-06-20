require 'rails_helper'

RSpec.describe LikesController, type: :controller do
  # Distinct username/domain so the user's ap_actor federated_url doesn't collide
  # with the sequenced ap_actor created by the :article factory.
  let(:user) { create(:user, :with_actor, username: 'liker', domain: 'liker.test') }
  let(:article) { create(:article) }

  def sign_in(user)
    session[:session_id] = create(:session, user: user).id
  end

  describe 'POST #create' do
    context 'when logged in with Mastodon credentials' do
      let(:mastodon_client) { instance_double(MastodonApiClient) }

      before do
        sign_in(user)
        allow(MastodonApiClient).to receive(:new).with(user).and_return(mastodon_client)
        allow(mastodon_client).to receive(:favourite_status).and_return(double)
      end

      it 'favourites on Mastodon and creates a like' do
        expect(mastodon_client).to receive(:favourite_status)

        expect {
          post :create, params: { article_id: article.id }
        }.to change { article.reload.likes_count }.by(1)

        like = article.likes.first
        expect(like.user_id).to eq(user.id)
        expect(like.remote_actor_url).to eq(user.ap_actor.federated_url)
      end

      it 'does not create a duplicate like' do
        create(:like, article: article, user: user)

        expect {
          post :create, params: { article_id: article.id }
        }.not_to change(Like, :count)
      end
    end

    context 'when logged in without Mastodon credentials' do
      let(:user) { create(:user, :with_actor, username: 'liker', domain: 'liker.test', access_token: nil) }

      before { sign_in(user) }

      it 'creates a local-only like' do
        expect {
          post :create, params: { article_id: article.id }
        }.to change { article.reload.likes_count }.by(1)

        expect(article.likes.first.federated_url).to be_nil
      end
    end

    context 'when not logged in' do
      it 'does not create a like' do
        expect {
          post :create, params: { article_id: article.id }
        }.not_to change(Like, :count)
      end
    end
  end

  describe 'DELETE #destroy' do
    context 'when the user has Mastodon credentials' do
      let(:mastodon_client) { instance_double(MastodonApiClient) }

      before do
        sign_in(user)
        allow(MastodonApiClient).to receive(:new).with(user).and_return(mastodon_client)
        allow(mastodon_client).to receive(:unfavourite_status).and_return(double)
      end

      it 'unfavourites on Mastodon and removes the like' do
        # Creating the like federates the article, so the unlike round-trips to Mastodon.
        create(:like, article: article, user: user)
        expect(article.reload.federated_url).to be_present

        expect(mastodon_client).to receive(:unfavourite_status)
        expect {
          delete :destroy, params: { article_id: article.id }
        }.to change { article.reload.likes_count }.by(-1)
      end
    end

    context 'when the user has no Mastodon credentials' do
      let(:user) { create(:user, :with_actor, username: 'liker', domain: 'liker.test', access_token: nil) }

      before { sign_in(user) }

      it 'removes the like without any Mastodon call' do
        create(:like, article: article, user: user)

        expect(MastodonApiClient).not_to receive(:new)
        expect {
          delete :destroy, params: { article_id: article.id }
        }.to change { article.reload.likes_count }.by(-1)
      end
    end
  end
end
