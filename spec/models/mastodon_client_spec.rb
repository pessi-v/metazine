require 'rails_helper'

RSpec.describe MastodonClient, type: :model do
  describe 'validations' do
    it { is_expected.to validate_presence_of(:domain) }
    it { is_expected.to validate_presence_of(:client_id) }
    it { is_expected.to validate_presence_of(:client_secret) }

    describe 'uniqueness of domain' do
      subject { build(:mastodon_client) }
      it { is_expected.to validate_uniqueness_of(:domain) }
    end
  end

  describe '.register_app' do
    let(:domain) { 'mastodon.social' }
    let(:mock_client) { double('Mastodon::REST::Client') }
    let(:mock_app) do
      double('MastodonApp',
        client_id: 'test_client_id',
        client_secret: 'test_client_secret'
      )
    end

    before do
      allow(Mastodon::REST::Client).to receive(:new).and_return(mock_client)
      allow(mock_client).to receive(:create_app).and_return(mock_app)
    end

    context 'when client does not exist for domain' do
      it 'creates a new Mastodon app registration' do
        expect(Mastodon::REST::Client).to receive(:new)
          .with(base_url: "https://#{domain}")

        MastodonClient.register_app(domain)
      end

      it 'calls create_app with correct parameters' do
        expect(mock_client).to receive(:create_app).with(
          anything,  # app name
          kind_of(String),  # callback URL
          MastodonClient::SCOPES,
          kind_of(String)  # website URL
        )

        MastodonClient.register_app(domain)
      end

      it 'creates a new MastodonClient record' do
        expect {
          MastodonClient.register_app(domain)
        }.to change(MastodonClient, :count).by(1)
      end

      it 'stores the client credentials' do
        client = MastodonClient.register_app(domain)

        expect(client.domain).to eq(domain)
        expect(client.client_id).to eq('test_client_id')
        expect(client.client_secret).to eq('test_client_secret')
      end

      context 'in development environment' do
        before do
          allow(Rails.env).to receive(:development?).and_return(true)
        end

        it 'uses localhost callback URL' do
          expect(mock_client).to receive(:create_app).with(
            anything,
            'http://localhost:3000/auth/mastodon/callback',
            anything,
            anything
          )

          MastodonClient.register_app(domain)
        end
      end

      context 'in production environment' do
        before do
          allow(Rails.env).to receive(:development?).and_return(false)
          ENV['APP_HOST'] = 'example.com'
        end

        after do
          ENV.delete('APP_HOST')
        end

        it 'uses production callback URL' do
          expect(mock_client).to receive(:create_app).with(
            anything,
            'https://example.com/auth/mastodon/callback',
            anything,
            anything
          )

          MastodonClient.register_app(domain)
        end
      end
    end

    context 'when client already exists for domain' do
      let!(:existing_client) { create(:mastodon_client, domain: domain) }

      it 'returns the existing client' do
        client = MastodonClient.register_app(domain)

        expect(client.id).to eq(existing_client.id)
      end

      it 'does not create a new client' do
        expect {
          MastodonClient.register_app(domain)
        }.not_to change(MastodonClient, :count)
      end

      it 'does not call the Mastodon API' do
        expect(Mastodon::REST::Client).not_to receive(:new)

        MastodonClient.register_app(domain)
      end
    end

    context 'when Mastodon API call fails' do
      before do
        allow(mock_client).to receive(:create_app)
          .and_raise(StandardError.new('API Error'))
      end

      it 'raises the error' do
        expect {
          MastodonClient.register_app(domain)
        }.to raise_error(StandardError, 'API Error')
      end

      it 'does not create a MastodonClient record' do
        expect {
          MastodonClient.register_app(domain) rescue nil
        }.not_to change(MastodonClient, :count)
      end
    end
  end

  describe 'SCOPES constant' do
    it 'defines the required OAuth scopes' do
      expect(MastodonClient::SCOPES).to eq('read write:statuses write:follows')
    end
  end
end
