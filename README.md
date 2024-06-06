# Introduction
**Metazine** (from the Greek μετά, *meta*, meaning 'after' or 'beyond' - an adjective meaning 'more comprehensive' or 'transcending', and *magazine* - a periodical publication) is an experimental RSS/Atom feed client built as a Ruby on Rails app. It tries to present feed entries as articles of a unified online publication.


Features:
- Feed validation
- Newspaper-like presentation of articles
- Search across all articles
- In-app reader view for articles using the @mozilla/readability JS library

Planned:
- ActivityPub integration
- Comments
- Article translations


## Installation

### On Fly.io
Dockerfile should have the required changes for deployment to Fly.io.

### Locally
Make sure you have installed ruby, the 'rails' gem, nodejs and npm.

`git clone https://github.com/pessi-v/metazine.git
bundle
rails db:migrate
npm install jsdom
npm install @mozilla/readability`

run the app:
`bin/dev`

### env variables
You should define the following variables (in .env, for example):

`APP_NAME = <your instance name here>
APP_SHORT_DESCRIPTION = <whatever you want to say>`
