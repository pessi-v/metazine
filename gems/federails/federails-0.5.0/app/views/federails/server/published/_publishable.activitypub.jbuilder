context = true unless context == false
json.set! '@context', 'https://www.w3.org/ns/activitystreams' if context

publishable.to_activitypub_object.each_pair do |key, value|
  json.set! key, value
end

json.id publishable.federated_url
json.actor publishable.federails_actor.federated_url
json.to ['https://www.w3.org/ns/activitystreams#Public']
json.cc [publishable.federails_actor.followers_url]
