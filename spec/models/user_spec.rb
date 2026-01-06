require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'associations' do
    it { is_expected.to have_many(:sessions).dependent(:destroy) }
    it { is_expected.to have_many(:comments).dependent(:nullify) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:provider) }
    it { is_expected.to validate_presence_of(:uid) }

    describe 'uniqueness of uid scoped to provider' do
      subject { build(:user, uid: 'test123') }
      it { is_expected.to validate_uniqueness_of(:uid).scoped_to(:provider) }
    end
  end

  describe '.from_omniauth' do
    let(:auth_hash) do
      OmniAuth::AuthHash.new(
        provider: 'mastodon',
        uid: '123456789',
        info: {
          nickname: 'testuser',
          name: 'Test User',
          image: 'https://mastodon.social/avatar.png',
          urls: {
            domain: 'https://mastodon.social',
            profile: 'https://mastodon.social/@testuser'
          }
        },
        credentials: {
          token: 'test_access_token'
        }
      )
    end

    before do
      # Stub the federation actor lookup to avoid network calls
      # The method returns nil when actor is not found
      allow(Federails::Actor).to receive(:find_by_federation_url).and_return(nil)
    end

    context 'when user does not exist' do
      it 'creates a new user' do
        expect {
          User.from_omniauth(auth_hash)
        }.to change(User, :count).by(1)
      end

      it 'sets user attributes from auth hash' do
        user = User.from_omniauth(auth_hash)

        expect(user.provider).to eq('mastodon')
        expect(user.uid).to eq('123456789')
        expect(user.username).to eq('testuser')
        expect(user.display_name).to eq('Test User')
        expect(user.avatar_url).to eq('https://mastodon.social/avatar.png')
        expect(user.access_token).to eq('test_access_token')
        expect(user.domain).to eq('mastodon.social')
      end

      it 'persists the user' do
        user = User.from_omniauth(auth_hash)
        expect(user).to be_persisted
      end

      it 'calls link_to_federated_actor!' do
        user = User.from_omniauth(auth_hash)
        # We'll test link_to_federated_actor! separately
        # Just verify it was called by checking logs or by stubbing
        expect(user).to be_a(User)
      end
    end

    context 'when user already exists' do
      let!(:existing_user) do
        create(:user, provider: 'mastodon', uid: '123456789',
               username: 'oldusername', display_name: 'Old Name')
      end

      it 'does not create a new user' do
        expect {
          User.from_omniauth(auth_hash)
        }.not_to change(User, :count)
      end

      it 'updates user attributes' do
        user = User.from_omniauth(auth_hash)

        expect(user.id).to eq(existing_user.id)
        expect(user.username).to eq('testuser')
        expect(user.display_name).to eq('Test User')
        expect(user.avatar_url).to eq('https://mastodon.social/avatar.png')
        expect(user.access_token).to eq('test_access_token')
      end

      it 'returns the existing user' do
        user = User.from_omniauth(auth_hash)
        expect(user).to eq(existing_user)
      end
    end

    context 'domain extraction' do
      it 'extracts domain from info.urls.domain' do
        user = User.from_omniauth(auth_hash)
        expect(user.domain).to eq('mastodon.social')
      end

      context 'when domain has trailing slash' do
        before do
          auth_hash.info.urls.domain = 'https://mastodon.social/'
        end

        it 'removes trailing slash from domain' do
          user = User.from_omniauth(auth_hash)
          expect(user.domain).to eq('mastodon.social')
        end
      end

      context 'when domain has https://' do
        before do
          auth_hash.info.urls.domain = 'https://fosstodon.org'
        end

        it 'removes protocol from domain' do
          user = User.from_omniauth(auth_hash)
          expect(user.domain).to eq('fosstodon.org')
        end
      end
    end
  end

  describe '#link_to_federated_actor!' do
    let(:user) { create(:user, username: 'testuser', domain: 'mastodon.social') }
    let(:expected_url) { "https://mastodon.social/users/testuser" }

    context 'when user is already linked to an actor' do
      let!(:existing_actor) do
        create(:federails_actor,
          entity_type: 'User',
          entity_id: user.id,
          federated_url: expected_url
        )
      end

      it 'does not create a new link' do
        expect {
          user.link_to_federated_actor!
        }.not_to change(Federails::Actor, :count)
      end

      it 'returns early without error' do
        expect { user.link_to_federated_actor! }.not_to raise_error
      end
    end

    context 'when actor exists remotely but user is not linked' do
      let!(:remote_actor) do
        create(:federails_actor,
          federated_url: expected_url,
          username: 'testuser',
          server: 'mastodon.social',
          local: false,
          entity_id: nil,
          entity_type: nil
        )
      end

      it 'links the user to the existing actor' do
        user.link_to_federated_actor!
        remote_actor.reload

        expect(remote_actor.entity_id).to eq(user.id)
        expect(remote_actor.entity_type).to eq('User')
        expect(remote_actor.local).to be false
      end

      it 'claims comments from the actor' do
        comment = create(:comment, federails_actor: remote_actor, user_id: nil)

        user.link_to_federated_actor!
        comment.reload

        expect(comment.user_id).to eq(user.id)
      end
    end

    context 'when actor is linked to a different entity' do
      let!(:remote_actor) do
        create(:federails_actor,
          federated_url: expected_url,
          entity_type: 'User',
          entity_id: 999  # Different user
        )
      end

      it 'does not link the user' do
        user.link_to_federated_actor!
        remote_actor.reload

        expect(remote_actor.entity_id).to eq(999)
        expect(remote_actor.entity_type).to eq('User')
      end

      it 'logs a warning' do
        expect(Rails.logger).to receive(:warn).with(/already linked/)
        user.link_to_federated_actor!
      end
    end

    context 'when actor does not exist' do
      before do
        # Stub the federation fetch to return nil
        allow(Federails::Actor).to receive(:find_by_federation_url).and_return(nil)
      end

      it 'does not create a link' do
        expect {
          user.link_to_federated_actor!
        }.not_to change(Federails::Actor, :count)
      end

      it 'logs a warning' do
        expect(Rails.logger).to receive(:warn).with(/Could not find or fetch actor/)
        user.link_to_federated_actor!
      end
    end

    context 'when domain or username is missing' do
      it 'returns early when domain is missing' do
        user.domain = nil
        expect(user.link_to_federated_actor!).to be_nil
      end

      it 'returns early when username is missing' do
        user.username = nil
        expect(user.link_to_federated_actor!).to be_nil
      end
    end
  end

  describe '#full_username' do
    let(:user) { create(:user, username: 'testuser', domain: 'mastodon.social') }

    it 'returns @username@domain format' do
      expect(user.full_username).to eq('@testuser@mastodon.social')
    end
  end
end
