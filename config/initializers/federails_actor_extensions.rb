Rails.application.config.to_prepare do
  Federails::Actor.include FederailsActorExtensions
end