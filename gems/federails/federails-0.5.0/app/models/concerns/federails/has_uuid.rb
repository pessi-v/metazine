module Federails
  # Model concern providing UUIDs as model parameter (instead of IDs).
  #
  #
  # A _required_, `uuid` field is required on the model's table for this concern to work:
  #
  # ```rb
  # # Example migration
  # add_column :my_table, :uuid, :text, default: nil, index: { unique: true }
  # ```
  #
  # Usage:
  #
  # ```rb
  # class MyModel < ApplicationRecord
  #   include Federails::HasUuid
  # end
  #
  # # And now:
  # instance = MyModel.find_param 'aaaa_bbbb_cccc_dddd_....'
  # instance.to_param
  # # => 'aaaa_bbbb_cccc_dddd_....'
  # ```
  #
  # It can be added on existing tables without data migration as the `uuid` accessor will generate the value when missing.
  module HasUuid
    extend ActiveSupport::Concern

    included do
      before_validation :generate_uuid
      validates :uuid, presence: true, uniqueness: true

      def self.find_param(param)
        find_by!(uuid: param)
      end
    end

    # @return [String] The UUID
    def to_param
      uuid
    end

    # @return [String]
    def uuid
      # Override UUID accessor to provide lazy initialization of UUIDs for old data
      if self[:uuid].blank?
        generate_uuid
        save!
      end
      self[:uuid]
    end

    private

    def generate_uuid
      return if self[:uuid].present?

      (self.uuid = SecureRandom.uuid) while self[:uuid].blank? || self.class.exists?(uuid: self[:uuid])
    end
  end
end
