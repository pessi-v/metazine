class AddFederationToArticlesAndComments < ActiveRecord::Migration[8.0]
  def change
    [:articles, :comments].each do |table|
      add_column table, :federated_url, :string, null: true, default: nil
      add_reference table, :federails_actor, null: true, foreign_key: true
    end
  end
end
