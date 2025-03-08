context = true unless context == false
json.set! '@context', 'https://www.w3.org/ns/activitystreams' if context

json.id following.federated_url
json.type 'Follow'
json.actor following.actor.federated_url
json.object following.target_actor.federated_url
