# frozen_string_literal: true

Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  resources :sources
  # resources :articles

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", :as => :rails_health_check

  # Defines the root path route ("/")
  root "articles#frontpage", as: :frontpage

  mount Federails::Engine => "/"

  get "reader/(:id)", to: "articles#reader", as: :reader
  post "fetch_feeds", to: "sources#fetch_feeds", as: :fetch_feeds
  post "fetch_feed", to: "sources#fetch_feed", as: :fetch_feed
  get "sources_", to: "sources#sources_admin", as: :sources_admin
  get "list", to: "articles#list", as: :list
  get "search", to: "articles#search", as: :search
  # some Sources contain a period or some other special character in the name
  get ":source_name", to: "articles#articles_by_source",
    constraints: {source_name: %r{[^/]+}}, as: :articles_by_source
  get "articles/testing", to: "articles#testing", as: :testing
end
