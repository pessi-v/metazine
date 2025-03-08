module Federails
  class FederailsPolicy
    attr_reader :user, :record

    def initialize(user, record)
      @user = user
      @record = record
    end

    def index?
      true
    end

    def show?
      true
    end

    def create?
      @user.present?
    end

    def new?
      create?
    end

    def update?
      owner?
    end

    def edit?
      update?
    end

    def destroy?
      owner?
    end

    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user = user
        @scope = scope
      end

      def resolve
        scope.all
      end
    end

    private

    def owner?
      return false unless @user

      @record.actor_id == @user.federails_actor.id
    end

    def user_with_actor?
      @user && Federails.actor_entity?(@user) && !!@user.federails_actor
    end
  end
end
