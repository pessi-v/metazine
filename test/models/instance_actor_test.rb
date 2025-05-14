require "test_helper"

class InstanceActorTest < ActiveSupport::TestCase
  setup do
    # Clean up any existing instance actors to ensure test isolation
    InstanceActor.destroy_all
  end

  test "a new InstanceActor has an associated federails_actor" do
    instance_actor = InstanceActor.create(name: "instance")

    assert instance_actor.persisted?
    assert_not_nil instance_actor.federails_actor
    assert_equal "instance", instance_actor.federails_actor.username
  end

  test "cannot create more than one InstanceActor" do
    # Create the first instance actor
    first_actor = InstanceActor.create(name: "instance")
    assert first_actor.persisted?

    # Attempt to create a second instance actor
    second_actor = InstanceActor.new(name: "another_instance")
    assert_not second_actor.valid?
    assert_not second_actor.save

    # Verify the error message
    assert_includes second_actor.errors[:base], "Only one InstanceActor record is allowed"

    # Verify there's still only one record in the database
    assert_equal 1, InstanceActor.count
  end

  test "after_followed callback accepts the follow" do
    instance_actor = InstanceActor.create(name: "instance")

    # Create a mock follow object
    mock_follow = Minitest::Mock.new
    mock_follow.expect :accept!, true

    # Mock the federails_actor to be local
    mock_actor = Minitest::Mock.new
    mock_actor.expect :local?, true

    # Stub federails_actor method to return our mock
    instance_actor.stub :federails_actor, mock_actor do
      instance_actor.accept_follow(mock_follow)
    end

    # Verify the mock was called as expected
    mock_follow.verify
    mock_actor.verify
  end
end
