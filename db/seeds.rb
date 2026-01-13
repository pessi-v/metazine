# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

InstanceActor.create(name: "Editor")

Source.create(name: "Le Monde Diplomatique", url: "https://mondediplo.com/backend")
Source.create(name: "The Ecologist", url: "https://theecologist.org/whats_new/feed")
Source.create(name: "Grist", url: "https://grist.org/feed")
Source.create(name: "e360", url: "https://e360.yale.edu/feed.xml")
Source.create(name: "London Review of Books", url: "https://www.lrb.co.uk/feeds/rss")
Source.create(name: "Social Europe", url: "https://www.socialeurope.eu/feed")
Source.create(name: "n + 1", url: "https://www.nplusonemag.com/feed/")
Source.create(name: "The Baffler", url: "https://thebaffler.com/homepage/feed")
Source.create(name: "The Intercept", url: "https://theintercept.com//feed")
Source.create(name: "Harper's Magazine", url: "https://harpers.org/feed")
Source.create(name: "Orion", url: "https://orionmagazine.org/article/feed")
Source.create(name: "The New York Review of Books", url: "https://feeds.feedburner.com/nybooks")

Source.consume_all
