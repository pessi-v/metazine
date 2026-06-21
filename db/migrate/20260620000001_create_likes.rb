class CreateLikes < ActiveRecord::Migration[8.0]
  def change
    create_table :likes do |t|
      t.references :article, null: false, foreign_key: true
      t.bigint :user_id
      t.bigint :ap_actor_id
      t.string :federated_url
      t.text :remote_actor_url

      t.timestamps
    end

    add_index :likes, :user_id
    add_index :likes, :ap_actor_id
    add_index :likes, :federated_url

    # A given local user can like an article at most once
    add_index :likes, [:article_id, :user_id], unique: true,
      where: "user_id IS NOT NULL", name: "index_likes_on_article_and_user"

    # A given remote actor can like an article at most once
    add_index :likes, [:article_id, :remote_actor_url], unique: true,
      where: "remote_actor_url IS NOT NULL", name: "index_likes_on_article_and_remote_actor"

    add_column :articles, :likes_count, :integer, default: 0, null: false
  end
end
