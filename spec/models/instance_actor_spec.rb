require 'rails_helper'

RSpec.describe InstanceActor, type: :model do
  let!(:instance_actor) { InstanceActor.create!(name: 'press') }
  let(:remote_actor) do
    create(:federails_actor,
      username: 'testuser',
      federated_url: 'https://mastodon.social/users/testuser'
    )
  end

  describe 'follow handling' do
    context 'when receiving a follow request' do
      it 'automatically accepts the follow' do
        follow = Federails::Following.create!(
          actor: remote_actor,
          target_actor: instance_actor.federails_actor,
          federated_url: 'https://mastodon.social/activities/12345'
        )

        expect(follow.reload.status).to eq('accepted')
      end
    end
  end

  describe 'custom inbox handler' do
    let(:activity) do
      {
        'type' => 'Follow',
        'actor' => 'https://kolektiva.social/users/pes',
        'object' => {
          '@context' => ['https://www.w3.org/ns/activitystreams'],
          'id' => instance_actor.federails_actor.federated_url,
          'type' => 'Person',
          'preferredUsername' => 'press'
        },
        'id' => 'https://kolektiva.social/626b6b78-d419-4b5d-8f9d-f3cf9b979af2'
      }
    end

    before do
      # Stub the remote actor fetch
      allow(Federails::Actor).to receive(:find_or_create_by_object)
        .with('https://kolektiva.social/users/pes')
        .and_return(remote_actor)
    end

    it 'handles follow requests to instance actor' do
      expect {
        Fediverse::Inbox.handle_create_follow_request(activity)
      }.to change(Federails::Following, :count).by(1)

      follow = Federails::Following.last
      expect(follow.actor).to eq(remote_actor)
      expect(follow.target_actor).to eq(instance_actor.federails_actor)
      expect(follow.status).to eq('accepted')
    end

    context 'with different URL schemes' do
      it 'matches instance actor even with http vs https' do
        # Change the activity object to use http instead of https (or vice versa)
        original_url = instance_actor.federails_actor.federated_url
        activity['object']['id'] = original_url.gsub('http://', 'https://')

        expect {
          Fediverse::Inbox.handle_create_follow_request(activity)
        }.to change(Federails::Following, :count).by(1)
      end
    end

    context 'when target is not the instance actor' do
      let(:other_user) { create(:user, :with_actor, username: 'otheruser', domain: 'example.com') }
      let(:other_actor) { other_user.federails_actor }

      before do
        activity['object'] = other_actor.federated_url
        allow(Federails::Actor).to receive(:find_or_create_by_object)
          .with(other_actor.federated_url)
          .and_return(other_actor)
      end

      it 'uses default follow handling' do
        expect {
          Fediverse::Inbox.handle_create_follow_request(activity)
        }.to change(Federails::Following, :count).by(1)

        follow = Federails::Following.last
        expect(follow.target_actor).to eq(other_actor)
      end
    end
  end

  describe 'singleton constraint' do
    it 'allows only one InstanceActor' do
      expect {
        InstanceActor.create!(name: 'another')
      }.to raise_error(ActiveRecord::RecordInvalid, /Only one InstanceActor/)
    end
  end
end
