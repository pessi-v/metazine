# -*- encoding: utf-8 -*-
# stub: federails 0.5.0 ruby lib

Gem::Specification.new do |s|
  s.name = "federails".freeze
  s.version = "0.5.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "changelog_uri" => "https://gitlab.com/experimentslabs/federails/-/blob/main/CHANGELOG.md", "homepage_uri" => "https://experimentslabs.com", "rubygems_mfa_required" => "true", "source_code_uri" => "https://gitlab.com/experimentslabs/federails/" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Manuel Tancoigne".freeze]
  s.date = "2025-01-22"
  s.description = "An ActivityPub engine for Ruby on Rails".freeze
  s.email = ["manu@experimentslabs.com".freeze]
  s.homepage = "https://experimentslabs.com".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 3.1.2".freeze)
  s.rubygems_version = "3.5.23".freeze
  s.summary = "An ActivityPub engine for Ruby on Rails".freeze

  s.installed_by_version = "3.5.22".freeze

  s.specification_version = 4

  s.add_runtime_dependency(%q<faraday>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<faraday-follow_redirects>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<json-ld>.freeze, [">= 3.2.0".freeze])
  s.add_runtime_dependency(%q<json-ld-preloaded>.freeze, [">= 3.2.0".freeze])
  s.add_runtime_dependency(%q<kaminari>.freeze, [">= 1.2.0".freeze])
  s.add_runtime_dependency(%q<pundit>.freeze, [">= 2.3.0".freeze])
  s.add_runtime_dependency(%q<rails>.freeze, [">= 7.0.4".freeze])
end

