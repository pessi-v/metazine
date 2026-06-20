class AddFederatedContentToArticles < ActiveRecord::Migration[8.0]
  def change
    # HTML rendered by Rails (app/views/articles/_federated_content.html.slim) and
    # stored at federation time. The Fedify sidecar reads this for the ActivityPub
    # Page `content`, falling back to its inline builder when null (old articles).
    add_column :articles, :federated_content, :text
  end
end
