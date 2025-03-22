class Federails::ActorPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    true
  end

  def edit?
    index?
  end

  def update?
    index?
  end

  def destroy?
    index?
  end

  class Scope < ApplicationPolicy::Scope
  end
end
