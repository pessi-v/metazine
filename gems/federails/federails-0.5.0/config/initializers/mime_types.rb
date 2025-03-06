# Webfinger: https://datatracker.ietf.org/doc/html/rfc7033
Mime::Type.register 'application/jrd+json', :jrd
Mime::Type.register 'application/xrd+xml', :xrd

# ActivityPub: https://www.w3.org/TR/activitypub/#retrieving-objects
Mime::Type.register 'application/ld+json; profile="https://www.w3.org/ns/activitystreams"', :activitypub, ['application/activity+json']

# Nodeinfo: https://github.com/jhass/nodeinfo/blob/main/PROTOCOL.md#retrieval
Mime::Type.register 'application/json; profile="http://nodeinfo.diaspora.software/ns/schema/2.0#"', :nodeinfo

# Get current request parsers. Apparently we need to do it this way and can't add in-place, see
# https://api.rubyonrails.org/classes/ActionDispatch/Http/Parameters/ClassMethods.html#method-i-parameter_parsers-3D
parsers = ActionDispatch::Request.parameter_parsers
# Copy the default JSON parsing for JSON types
[:jrd, :activitypub, :nodeinfo].each do |mime_type|
  parsers[Mime[mime_type].symbol] = parsers[:json]
end
# XRD just needs a simple XML parser
parsers[Mime[:xrd].symbol] = ->(raw_post) { Hash.from_xml(raw_post) || {} }
# Store updated parsers
ActionDispatch::Request.parameter_parsers = parsers
