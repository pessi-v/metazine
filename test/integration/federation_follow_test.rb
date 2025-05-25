# require "test_helper"
# require "mocha/minitest"

# class FederationFollowTest < ActionDispatch::IntegrationTest
#   setup do
#     # Clean up any existing instance actors to ensure test isolation
#     InstanceActor.destroy_all

#     # Create our instance actor
#     @instance_actor = InstanceActor.create(name: "instance")

#     # Follower actor details from the logs
#     @follower_actor_url = "https://noc.social/users/pes"
#     @follower_inbox_url = "https://noc.social/users/pes/inbox"

#     # Follow activity details
#     @follow_activity_id = "https://noc.social/90f13640-d7c3-4ff4-9030-73c025194b6e"

#     # Actor data that will be returned in JSON response
#     @follower_actor_json = {
#       "@context" => ["https://www.w3.org/ns/activitystreams", "https://w3id.org/security/v1"],
#       "id" => @follower_actor_url,
#       "type" => "Person",
#       "following" => "https://noc.social/users/pes/following",
#       "followers" => "https://noc.social/users/pes/followers",
#       "inbox" => @follower_inbox_url,
#       "outbox" => "https://noc.social/users/pes/outbox",
#       "preferredUsername" => "pes",
#       "name" => "",
#       "url" => "https://noc.social/@pes",
#       "publicKey" => {
#         "id" => "https://noc.social/users/pes#main-key",
#         "owner" => "https://noc.social/users/pes",
#         "publicKeyPem" => "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn1PeFeCAwABwm9TnUbuT\nocik9XaJEZG5bLEoXRDyg0GrjV9NsMNydTJrkTvBJ2RhSwo6vtmYMM96uVv8r/go\na+JcjTMJ568TUr4iPeIEjKOj8D5Ah0Z7KaKU/Vl2Tx1l9/bPUdZ//sieSZ912Odw\ntwLc6p/aIjjKpAAt9B+gBdLPYn6bc4koz1/C6sO6PqsG/EEKLZszuvhZh5xiYgO0\n5qErxj/O41LDmccGJBtHOR2RF8BQVHn67YVNsUZuELPSusABsK3cB+oeE3JBetTg\nQLrwysm1lwxZC17VY901/LGzT0/qPrJBW+arM49Csun4Gf1qlz2Hq4LhFNO2L2uD\nyQIDAQAB\n-----END PUBLIC KEY-----\n"
#       },
#       "endpoints" => {"sharedInbox" => "https://noc.social/inbox"}
#     }
#     # We'll use this to temporarily store a new actor if one is created
#     @created_actor = nil
#   end

#   test "receiving a follow request and sending an accept" do
#     # Mock Federails::Actor.find_by_federation_url to return nil first time (triggering fetch)
#     # and then return our created actor subsequently
#     Federails::Actor.stubs(:find_by_federation_url).with(@follower_actor_url).returns(nil).then.returns(lambda { @created_actor })

#     # Mock the instance actor finder to return our instance actor
#     Federails::Actor.stubs(:instance_actor).returns(@instance_actor)

#     # Mock Actor.new to track the created actor
#     real_new = Federails::Actor.method(:new)
#     Federails::Actor.stubs(:new).with do |args|
#       if args[:federated_url] == @follower_actor_url
#         @created_actor = real_new.call(args)
#         true
#       else
#         true
#       end
#     end.returns(lambda { @created_actor || real_new.call })

#     # Mock Fediverse::Inbox dispatcher
#     inbox_dispatcher = mock("inbox_dispatcher")
#     inbox_dispatcher.expects(:handle_create_follow_request).returns(true)
#     Fediverse::Inbox.stubs(:new).returns(inbox_dispatcher)

#     # Mock the ActiveJob enqueuing
#     Federails::NotifyInboxJob.expects(:perform_later).once

#     # Prepare the follow activity as seen in the logs
#     follow_activity = {
#       "@context" => "https://www.w3.org/ns/activitystreams",
#       "id" => @follow_activity_id,
#       "type" => "Follow",
#       "actor" => @follower_actor_url,
#       "object" => @instance_actor.federails_actor.federated_url
#     }

#     # Simulate receiving a follow request
#     post "/federation/actors/#{@instance_actor.federails_actor.uuid}/inbox",
#       params: follow_activity.to_json,
#       headers: {
#         "Content-Type" => "application/activity+json",
#         "Accept" => "application/activity+json",
#         "Signature" => 'keyId="https://noc.social/users/pes#main-key",algorithm="rsa-sha256",headers="host date digest content-type (request-target)",signature="..."',
#         "Date" => Time.now.utc.httpdate,
#         "Digest" => "SHA-256=" + Digest::SHA256.base64digest(follow_activity.to_json)
#       }

#     # Assert HTTP response - 201 Created as per logs
#     assert_response :created
#   end
# end
