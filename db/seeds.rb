# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

rsa = OpenSSL::PKey::RSA.generate(2048)
InstanceActor.create!(
  name: ENV.fetch("INSTANCE_NAME", "press"),
  public_key: rsa.public_key.to_pem,
  private_key: rsa.to_pem
)

Source.find_or_create_by!(name: "Le Monde Diplomatique") { |s| s.url = "https://mondediplo.com/backend" }
Source.find_or_create_by!(name: "The Ecologist") { |s| s.url = "https://theecologist.org/whats_new/feed" }
Source.find_or_create_by!(name: "Grist") { |s| s.url = "https://grist.org/feed" }
Source.find_or_create_by!(name: "e360") { |s| s.url = "https://e360.yale.edu/feed.xml" }
Source.find_or_create_by!(name: "London Review of Books") { |s| s.url = "https://www.lrb.co.uk/feeds/rss" }
Source.find_or_create_by!(name: "Social Europe") { |s| s.url = "https://www.socialeurope.eu/feed" }
Source.find_or_create_by!(name: "n + 1") { |s| s.url = "https://www.nplusonemag.com/feed/" }
Source.find_or_create_by!(name: "The Baffler") { |s| s.url = "https://thebaffler.com/homepage/feed" }
Source.find_or_create_by!(name: "The Intercept") { |s| s.url = "https://theintercept.com//feed" }
Source.find_or_create_by!(name: "Harper's Magazine") { |s| s.url = "https://harpers.org/feed" }
Source.find_or_create_by!(name: "Orion") { |s| s.url = "https://orionmagazine.org/article/feed" }
Source.find_or_create_by!(name: "The New York Review of Books") { |s| s.url = "https://feeds.feedburner.com/nybooks" }
