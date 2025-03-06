json.set!('@context', 'https://www.w3.org/ns/activitystreams')
collection_id = @actor.followers_url
json.id collection_id
json.type 'OrderedCollectionPage'
json.totalItems @total_actors
json.first Federails::Engine.routes.url_helpers.followers_server_actor_url(@actor)
json.last @actors.total_pages == 1 ? Federails::Engine.routes.url_helpers.followers_server_actor_url(@actor) : Federails::Engine.routes.url_helpers.followers_server_actor_url(@actor, page: @actors.total_pages)
json.current do |j|
  j.type 'OrderedCollectionPage'
  j.id @actors.current_page == 1 ? Federails::Engine.routes.url_helpers.followers_server_actor_url(@actor) : Federails::Engine.routes.url_helpers.followers_server_actor_url(@actor, page: @actors.current_page)
  j.partOf collection_id
  j.next @actors.next_page
  j.prev @actors.prev_page
  j.totalItems @total_actors
  j.orderedItems do
    json.array! @actors.map(&:federated_url)
  end
end
