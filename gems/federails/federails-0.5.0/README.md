# Federails

Federails is an engine that brings ActivityPub to Ruby on Rails application.

## Community

You can join the [matrix chat room](https://matrix.to/#/#federails:matrix.org) to chat with humans.

Open issues or feature requests on the [issue tracker](https://gitlab.com/experimentslabs/federails/-/issues)

## Features

This engine is meant to be used in Rails applications to add the ability to act as an ActivityPub server.

As the project is in an early stage of development we're unable to provide a clean list of what works and what is missing.

The general direction is to be able to:

- publish and subscribe to any type of content
- have a discovery endpoint (`webfinger`)
- have a following/followers system
- implement all the parts of the (RFC) labelled with **MUST** and **MUST NOT**
- implement some or all the parts of the RFC labelled with **SHOULD** and **SHOULD NOT**
- maybe implement the parts of the RFC labelled with **MAY**

## Documentation

- [Usage](docs/usage.md)
- [Common questions](docs/faq.md)
- [Contributing](docs/contributing.md)

## License

The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
