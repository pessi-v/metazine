module FederailsActorExtensions
  extend ActiveSupport::Concern

  included do
    # Add validations, associations, etc.
    scope :users, -> { where(entity_type: 'User') }
  end

  class_methods do
    # def custom_class_method
    #   # Your custom class method
    # end
  end

  # def custom_instance_method
  #   # Your custom instance method
  # end
end