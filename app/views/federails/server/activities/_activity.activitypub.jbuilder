context = true unless context == false
addressing = true unless addressing == false
set_json_ld_context(json) if context

json.id Federails::Engine.routes.url_helpers.server_actor_activity_url activity.actor, activity
json.type activity.action == 'Forward' ? 'Announce' : activity.action
json.actor activity.actor.federated_url

# Special addressing for Forward (Quiet Public Announce)
# Use "unlisted" visibility pattern to reduce timeline noise
if activity.action == 'Forward'
  if addressing
    # Quiet Public pattern: to = followers, cc = Public
    # This makes it publicly accessible but doesn't show in public timelines
    json.to [activity.actor.followers_url]
    json.cc ['https://www.w3.org/ns/activitystreams#Public']
  end

  # Announce the comment URL
  if activity.entity.respond_to?(:federated_url)
    json.object activity.entity.federated_url
  end
else
  # Standard addressing
  if addressing
    json.to ['https://www.w3.org/ns/activitystreams#Public']
    json.cc [activity.actor.followers_url]
  end

  # Standard object handling
  if activity.action == 'Announce' && activity.entity.respond_to?(:federated_url)
    json.object activity.entity.federated_url
  elsif activity.entity.is_a? Federails::Activity
    json.object { json.partial!('federails/server/activities/activity', activity: activity.entity, context: false, addressing: false) }
  elsif activity.entity.respond_to? :to_activitypub_object
    json.object activity.entity.to_activitypub_object
  elsif activity.entity.respond_to? :federated_url
    json.object activity.entity.federated_url
  end
end
