# frozen_string_literal: true

class User < ApplicationRecord
  include Federails::ActorEntity
  include Federails::Engine.routes.url_helpers

  acts_as_federails_actor(
    username_field: :name, # or whatever field you use for usernames
    name_field: :name, # or whatever field you use for display names
    # profile_url_method: 'bob',  # method that returns the user's profile URL
    actor_type: 'Service',
    auto_create_actors: true
  )

  after_create :create_federails_actor

end
