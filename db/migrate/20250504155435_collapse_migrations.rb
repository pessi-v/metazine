class CollapseMigrations < ActiveRecord::Migration[8.0]
  def change
    # These are extensions that must be enabled in order to support this database
    # enable_extension "pg_catalog.plpgsql"
    # enable_extension "unaccent"

    # create_table "articles", force: :cascade do |t|
    #   t.string "title"
    #   t.string "image_url"
    #   t.string "url"
    #   t.datetime "created_at", null: false
    #   t.datetime "updated_at", null: false
    #   t.string "description"
    #   t.string "source_name"
    #   t.datetime "published_at"
    #   t.integer "source_id"
    #   t.boolean "paywalled", default: false
    #   t.integer "description_length"
    #   t.jsonb "readability_output_jsonb", default: "{}", null: false
    #   t.jsonb "tags"
    #   t.string "federated_url"
    #   t.bigint "federails_actor_id"
    #   t.index ["federails_actor_id"], name: "index_articles_on_federails_actor_id"
    #   t.index ["url", "title"], name: "index_articles_on_url_and_title", unique: true
    # end

    # create_table "comments", force: :cascade do |t|
    #   t.text "content", null: false
    #   t.string "parent_type", null: false
    #   t.integer "parent_id", null: false
    #   t.datetime "created_at", null: false
    #   t.datetime "updated_at", null: false
    #   t.string "federated_url"
    #   t.bigint "federails_actor_id"
    #   t.index ["federails_actor_id"], name: "index_comments_on_federails_actor_id"
    #   t.index ["parent_type", "parent_id"], name: "index_poly_comments_on_parent"
    # end

    # create_table "federails_activities", force: :cascade do |t|
    #   t.string "entity_type", null: false
    #   t.bigint "entity_id", null: false
    #   t.string "action", null: false
    #   t.bigint "actor_id", null: false
    #   t.datetime "created_at", null: false
    #   t.datetime "updated_at", null: false
    #   t.string "uuid"
    #   t.index ["actor_id"], name: "index_federails_activities_on_actor_id"
    #   t.index ["entity_type", "entity_id"], name: "index_federails_activities_on_entity"
    #   t.index ["uuid"], name: "index_federails_activities_on_uuid", unique: true
    # end

    # create_table "federails_actors", force: :cascade do |t|
    #   t.string "name"
    #   t.string "federated_url"
    #   t.string "username"
    #   t.string "server"
    #   t.string "inbox_url"
    #   t.string "outbox_url"
    #   t.string "followers_url"
    #   t.string "followings_url"
    #   t.string "profile_url"
    #   t.boolean "local"
    #   t.integer "entity_id"
    #   t.string "entity_type"
    #   t.datetime "created_at", null: false
    #   t.datetime "updated_at", null: false
    #   t.string "uuid"
    #   t.text "public_key"
    #   t.text "private_key"
    #   t.datetime "tombstoned_at"
    #   t.index ["entity_type", "entity_id"], name: "index_federails_actors_on_entity", unique: true
    #   t.index ["federated_url"], name: "index_federails_actors_on_federated_url", unique: true
    #   t.index ["uuid"], name: "index_federails_actors_on_uuid", unique: true
    # end

    # create_table "federails_followings", force: :cascade do |t|
    #   t.bigint "actor_id", null: false
    #   t.bigint "target_actor_id", null: false
    #   t.integer "status", default: 0
    #   t.string "federated_url"
    #   t.datetime "created_at", null: false
    #   t.datetime "updated_at", null: false
    #   t.string "uuid"
    #   t.index ["actor_id", "target_actor_id"], name: "index_federails_followings_on_actor_id_and_target_actor_id", unique: true
    #   t.index ["actor_id"], name: "index_federails_followings_on_actor_id"
    #   t.index ["target_actor_id"], name: "index_federails_followings_on_target_actor_id"
    #   t.index ["uuid"], name: "index_federails_followings_on_uuid", unique: true
    # end

    # create_table "instance_actors", force: :cascade do |t|
    #   t.datetime "created_at", null: false
    #   t.datetime "updated_at", null: false
    #   t.string "name"
    # end

    # create_table "sources", force: :cascade do |t|
    #   t.string "name"
    #   t.string "url"
    #   t.string "last_modified"
    #   t.string "etag"
    #   t.boolean "active"
    #   t.boolean "show_images"
    #   t.string "last_error_status"
    #   t.datetime "created_at", null: false
    #   t.datetime "updated_at", null: false
    #   t.boolean "allow_video", default: false
    #   t.boolean "allow_audio", default: false
    #   t.string "description"
    #   t.string "image_url"
    #   t.integer "articles_count"
    #   t.string "last_built"
    # end

    # add_foreign_key "articles", "federails_actors"
    # add_foreign_key "comments", "federails_actors"
    # add_foreign_key "federails_activities", "federails_actors", column: "actor_id"
    # add_foreign_key "federails_followings", "federails_actors", column: "actor_id"
    # add_foreign_key "federails_followings", "federails_actors", column: "target_actor_id"
  end
end
