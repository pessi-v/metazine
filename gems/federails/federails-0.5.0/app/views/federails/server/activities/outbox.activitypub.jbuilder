json.set!('@context', 'https://www.w3.org/ns/activitystreams')
collection_id = @actor.outbox_url
json.id collection_id
json.type 'OrderedCollectionPage'
json.totalItems @total_activities
json.first collection_id
json.last @activities.total_pages == 1 ? Federails::Engine.routes.url_helpers.server_actor_outbox_url(@actor) : Federails::Engine.routes.url_helpers.server_actor_outbox_url(@actor, page: @activities.total_pages)
json.current do |j|
  j.type 'OrderedCollectionPage'
  j.id @activities.current_page == 1 ? Federails::Engine.routes.url_helpers.server_actor_outbox_url(@actor) : Federails::Engine.routes.url_helpers.server_actor_outbox_url(@actor, page: @activities.current_page)
  j.partOf collection_id
  j.next @activities.next_page
  j.prev @activities.prev_page
  j.totalItems @total_activities
  j.orderedItems do
    json.array! @activities, partial: 'federails/server/activities/activity', as: :activity, context: false
  end
end
