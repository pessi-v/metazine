class AddScopesToMastodonClients < ActiveRecord::Migration[8.0]
  def change
    # Nullable: existing rows have nil scopes, which is treated as "stale" so the
    # app re-registers with the current scopes on the next login for that domain.
    add_column :mastodon_clients, :scopes, :string
  end
end
