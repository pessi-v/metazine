module Federails
  class Actor < ApplicationRecord
    self.table_name = "federails_actors"

    belongs_to :entity, polymorphic: true, optional: true

    validates :federated_url, uniqueness: true, allow_nil: true

    def local?
      local == true
    end

    def distant?
      !local?
    end

    # Federails gem compat: simple DB lookup (no remote fetch)
    def self.find_by_federation_url(url)
      find_by(federated_url: url)
    end
  end
end
