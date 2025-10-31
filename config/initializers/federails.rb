require "fediverse/inbox"

Federails.configure do |conf|
  conf.app_name = "Metazine"
  conf.app_version = 0.1

  scheme = Rails.application.config.force_ssl ? "https" : "http"
  conf.site_host = "#{scheme}://#{Rails.application.default_url_options[:host]}"
  conf.site_port = Rails.application.default_url_options[:port]
  conf.force_ssl = Rails.application.config.force_ssl

  conf.enable_discovery = true
  conf.open_registrations = false
  # conf.server_routes_path = "federation"
  # conf.client_routes_path = "client"

  # conf.remote_follow_url_method = :new_follow_url
end

Rails.application.config.after_initialize do
  # Ensure actor models are loaded so they register with federails
  User
  InstanceActor

  # Register handlers for Create, Update, and Delete activities with Note objects (comments/replies)
  Fediverse::Inbox.register_handler("Create", "Note", ActivityPub::NoteActivityHandler, :handle_create_note)
  Fediverse::Inbox.register_handler("Update", "Note", ActivityPub::NoteActivityHandler, :handle_update_note)
  Fediverse::Inbox.register_handler("Delete", "Note", ActivityPub::NoteActivityHandler, :handle_delete_note)

  # Register handlers for Create and Update activities with Actor objects (Person, Application, etc.)
  Fediverse::Inbox.register_handler("Create", "Person", ActivityPub::ActorActivityHandler, :handle_create_activity)
  Fediverse::Inbox.register_handler("Update", "Person", ActivityPub::ActorActivityHandler, :handle_update_activity)
  Fediverse::Inbox.register_handler("Create", "Application", ActivityPub::ActorActivityHandler, :handle_create_activity)
  Fediverse::Inbox.register_handler("Update", "Application", ActivityPub::ActorActivityHandler, :handle_update_activity)

  # Follow activities are handled by federails built-in handlers
  # They should already be registered automatically when federails loads

  # Debug: Log registered handlers to verify all handlers are registered
  Rails.logger.info "=== Federails handlers check ==="
  Rails.logger.info "Follow handlers: #{Fediverse::Inbox.class_variable_get(:@@handlers)['Follow'].inspect}"
  Rails.logger.info "Create handlers: #{Fediverse::Inbox.class_variable_get(:@@handlers)['Create'].inspect}"
  Rails.logger.info "All handlers: #{Fediverse::Inbox.class_variable_get(:@@handlers).keys.inspect}"
end
