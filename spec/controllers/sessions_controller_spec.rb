require 'rails_helper'

RSpec.describe SessionsController, type: :controller do
  before do
    # Stub federation actor lookup to avoid network calls in all tests
    allow(Federails::Actor).to receive(:find_by_federation_url).and_return(nil)
  end

  describe 'POST #mastodon' do
    context 'with valid domain' do
      it 'redirects to OmniAuth with identifier parameter' do
        post :mastodon, params: { domain: 'mastodon.social' }

        expect(response).to redirect_to('/auth/mastodon?identifier=mastodon.social')
      end

      it 'strips and downcases the domain' do
        post :mastodon, params: { domain: '  Mastodon.Social  ' }

        expect(response).to redirect_to('/auth/mastodon?identifier=mastodon.social')
      end

      it 'stores the return URL in session' do
        request.env['HTTP_REFERER'] = 'https://example.com/reader/123'
        post :mastodon, params: { domain: 'mastodon.social' }

        expect(session[:return_to]).to eq('https://example.com/reader/123')
      end
    end

    context 'with blank domain' do
      it 'redirects back with alert' do
        request.env['HTTP_REFERER'] = '/reader'
        post :mastodon, params: { domain: '' }

        expect(response).to redirect_to('/reader')
        expect(flash[:alert]).to eq('Please enter your Mastodon instance domain')
      end
    end

    context 'with nil domain' do
      it 'redirects back with alert' do
        request.env['HTTP_REFERER'] = '/reader'
        post :mastodon, params: { domain: nil }

        expect(response).to redirect_to('/reader')
        expect(flash[:alert]).to eq('Please enter your Mastodon instance domain')
      end
    end
  end

  describe 'GET/POST #create' do
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
      request.env['omniauth.auth'] = auth_hash
      # Use same-host URL to avoid UnsafeRedirectError in tests
      request.env['omniauth.origin'] = '/reader/123'
    end

    context 'when authentication is successful' do
      it 'creates a new user' do
        expect {
          get :create
        }.to change(User, :count).by(1)
      end

      it 'creates a new session for the user' do
        expect {
          get :create
        }.to change(Session, :count).by(1)

        user = User.last
        session_record = Session.last

        expect(session_record.user_id).to eq(user.id)
        expect(session_record.ip_address).to eq(request.remote_ip)
        expect(session_record.user_agent).to eq(request.user_agent)
      end

      it 'sets session_id in signed cookie' do
        get :create

        session_record = Session.last
        expect(cookies.signed[:session_id]).to eq(session_record.id)
      end

      it 'sets session_id in session hash' do
        get :create

        user = User.last
        session_record = Session.last

        expect(session[:session_id]).to eq(session_record.id)
        expect(session[:user_id]).to eq(user.id)
      end

      it 'redirects to the origin URL' do
        get :create

        expect(response).to redirect_to('/reader/123')
      end

      it 'displays success notice with username' do
        get :create

        user = User.last
        expect(flash[:notice]).to eq("Successfully logged in as #{user.full_username}!")
      end

      context 'when origin is not set' do
        before do
          request.env['omniauth.origin'] = nil
        end

        it 'redirects to frontpage' do
          get :create

          expect(response).to redirect_to(frontpage_path)
        end
      end
    end

    context 'when user already exists' do
      let!(:existing_user) do
        create(:user, provider: 'mastodon', uid: '123456789')
      end

      it 'does not create a new user' do
        expect {
          get :create
        }.not_to change(User, :count)
      end

      it 'creates a new session for existing user' do
        expect {
          get :create
        }.to change(Session, :count).by(1)

        expect(Session.last.user_id).to eq(existing_user.id)
      end

      it 'updates user attributes' do
        get :create

        existing_user.reload
        expect(existing_user.username).to eq('testuser')
        expect(existing_user.display_name).to eq('Test User')
        expect(existing_user.access_token).to eq('test_access_token')
      end
    end

    context 'when auth hash is missing' do
      before do
        request.env['omniauth.auth'] = nil
      end

      it 'redirects back with alert' do
        request.env['HTTP_REFERER'] = '/reader'
        get :create

        expect(response).to redirect_to('/reader')
        expect(flash[:alert]).to eq('Authentication failed. Please try again.')
      end
    end
  end

  describe 'DELETE #destroy' do
    let(:user) { create(:user) }
    let(:session_record) { create(:session, user: user) }

    before do
      cookies.signed[:session_id] = session_record.id
      allow(controller).to receive(:current_session).and_return(session_record)
    end

    it 'destroys the current session' do
      expect {
        delete :destroy
      }.to change(Session, :count).by(-1)
    end

    it 'resets the session' do
      delete :destroy

      expect(session[:session_id]).to be_nil
      expect(session[:user_id]).to be_nil
    end

    it 'deletes the session_id cookie' do
      delete :destroy

      expect(cookies[:session_id]).to be_nil
    end

    it 'redirects back with notice' do
      request.env['HTTP_REFERER'] = '/reader'
      delete :destroy

      expect(response).to redirect_to('/reader')
      expect(flash[:notice]).to eq('Logged out successfully.')
    end

    context 'when no current session exists' do
      before do
        allow(controller).to receive(:current_session).and_return(nil)
      end

      it 'does not raise an error' do
        expect {
          delete :destroy
        }.not_to raise_error
      end

      it 'still resets session and cookies' do
        delete :destroy

        expect(session[:session_id]).to be_nil
        expect(cookies[:session_id]).to be_nil
      end
    end
  end

  describe 'GET #failure' do
    it 'redirects back with error message' do
      request.env['HTTP_REFERER'] = '/reader'
      get :failure, params: { message: 'invalid_credentials' }

      expect(response).to redirect_to('/reader')
      expect(flash[:alert]).to eq('Authentication failed: invalid_credentials')
    end
  end
end
