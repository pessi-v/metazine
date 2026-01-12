context = true unless context == false
addressing = true unless addressing == false
set_json_ld_context(json) if context

json.id Federails::Engine.routes.url_helpers.server_actor_activity_url activity.actor, activity

# Standard activity rendering
json.type activity.action
json.actor activity.actor.federated_url

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
