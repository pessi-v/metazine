# frozen_string_literal: true

class User < ApplicationRecord
  include Federails::ActorEntity

  acts_as_federails_actor(
    username_field: :name,      # or whatever field you use for usernames
    name_field: :name,             # or whatever field you use for display names
    profile_url_method: :user_url,  # method that returns the user's profile URL
    actor_type: 'Person',
    auto_create_actors: true
  )

  after_create :create_federails_actor

  private

  # Creates the actor or destroys it, depending on the condition
  def create_or_destroy_federails_actor!
    create_federails_actor if create_federails_actor?
    actor.destroy!
    # actor.destroy! if role != :community_manager && role_previously_was == :community_manager && self.federails_actor.present?
  end
end
