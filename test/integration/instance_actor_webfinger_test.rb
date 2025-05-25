require "test_helper"

class InstanceActorWebfingerTest < ActionDispatch::IntegrationTest
  setup do
    # Clean up any existing instance actors to ensure test isolation
    InstanceActor.destroy_all

    # Create an instance actor for testing
    @instance_actor = InstanceActor.create(name: "instance")
  end

  test "there is a Webfinger for the InstanceActor at the expected URL" do
    host = "localhost:3000"

    # Build the expected Webfinger URL
    webfinger_resource = "acct:#{@instance_actor.name}@#{host}"
    webfinger_url = "/.well-known/webfinger?resource=#{CGI.escape(webfinger_resource)}"

    # Make the request to the Webfinger endpoint
    get webfinger_url

    # Assert that the response is successful
    assert_response :success

    # Parse the JSON response
    json_response = JSON.parse(response.body)

    # Verify the Webfinger response contains the expected data
    assert_equal webfinger_resource, json_response["subject"]

    # Verify the response contains links to the actor
    actor_link = json_response["links"].find { |link| link["rel"] == "self" }
    assert_not_nil actor_link, "Webfinger response should contain a 'self' link"

    # Verify the actor URL matches the expected pattern
    expected_url = @instance_actor.federails_actor.federated_url
    assert_equal expected_url, actor_link["href"]
  end
end
