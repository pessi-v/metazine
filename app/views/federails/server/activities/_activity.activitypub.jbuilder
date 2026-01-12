context = true unless context == false
addressing = true unless addressing == false
set_json_ld_context(json) if context

json.id Federails::Engine.routes.url_helpers.server_actor_activity_url activity.actor, activity

# Special handling for Forward - render as Create from instance actor
# This delivers comments to followers without the "boost" UI noise
if activity.action == 'Forward' && activity.entity.is_a?(Comment)
  comment = activity.entity

  json.type 'Create'
  json.actor activity.actor.federated_url  # Instance actor (so we can sign it)
  json.published comment.created_at.iso8601

  if addressing
    # Send to followers with Public in CC (unlisted-style)
    json.to [activity.actor.followers_url]
    json.cc ['https://www.w3.org/ns/activitystreams#Public']
  end

  # The object is a Note with proper attribution to the original author
  json.object do
    json.id comment.federated_url  # Original Mastodon URL
    json.type 'Note'
    json.attributedTo comment.federails_actor.federated_url  # Original author
    json.inReplyTo comment.parent.federated_url if comment.parent&.federated_url
    json.published comment.created_at.iso8601
    json.content comment.content
    json.url comment.federated_url

    # Copy the original addressing to maintain thread visibility
    if comment.parent&.federails_actor
      json.to ['https://www.w3.org/ns/activitystreams#Public']
      json.cc [comment.parent.federails_actor.federated_url]
    else
      json.to ['https://www.w3.org/ns/activitystreams#Public']
    end
  end
else
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
end
