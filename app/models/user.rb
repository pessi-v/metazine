# frozen_string_literal: true

class User < ApplicationRecord
  include Federails::ActorEntity

  acts_as_federails_actor(
    username_field: :name,
    name_field: :name
  )

  def federails_actor
    act = Federails::Actor.find_by(entity: self)
    if act.nil?
      act = create_federails_actor
      reload
    end
    act
  end

  def remote?
    !federails_actor&.local?
  end
end
