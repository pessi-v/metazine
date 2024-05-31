json.extract! source, :id, :name, :url, :last_modified, :etag, :active, :show_images, :last_error_status, :created_at, :updated_at
json.url source_url(source, format: :json)
