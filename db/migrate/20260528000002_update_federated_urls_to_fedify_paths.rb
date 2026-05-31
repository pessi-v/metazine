class UpdateFederatedUrlsToFedifyPaths < ActiveRecord::Migration[8.0]
  def up
    # Rewrite article federated_url from the old Federails path pattern
    # (https://host/federation/published/articles/ID) to the new Fedify path
    # (https://host/ap/articles/ID), keeping the host intact.
    execute <<~SQL
      UPDATE articles
      SET federated_url = regexp_replace(
        federated_url,
        '/federation/published/articles/[0-9]+$',
        '/ap/articles/' || id::text
      )
      WHERE federated_url ~ '/federation/published/articles/[0-9]+'
    SQL
  end

  def down
    execute <<~SQL
      UPDATE articles
      SET federated_url = regexp_replace(
        federated_url,
        '/ap/articles/[0-9]+$',
        '/federation/published/articles/' || id::text
      )
      WHERE federated_url ~ '/ap/articles/[0-9]+'
    SQL
  end
end
