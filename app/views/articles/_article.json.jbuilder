# frozen_string_literal: true

json.extract! article, :id, :title, :image_url, :url, :preview_text, :created_at, :updated_at
json.url article_url(article, format: :json)
