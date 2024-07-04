# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2024_07_04_165939) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "unaccent"

  create_table "articles", force: :cascade do |t|
    t.string "title"
    t.string "image_url"
    t.string "url"
    t.string "preview_text"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "description"
    t.string "summary"
    t.string "source_name"
    t.text "readability_output"
    t.datetime "published_at"
    t.integer "source_id"
    t.index ["url", "title"], name: "index_articles_on_url_and_title", unique: true
  end

  create_table "sources", force: :cascade do |t|
    t.string "name"
    t.string "url"
    t.string "last_modified"
    t.string "etag"
    t.boolean "active"
    t.boolean "show_images"
    t.string "last_error_status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "allow_video", default: false
    t.boolean "allow_audio", default: false
    t.string "description"
    t.string "image_url"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.boolean "admin", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
