Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  resources :sources

  # Comments routes
  resources :articles, only: [] do
    resources :comments, only: [:create]
  end
  resources :comments, only: [:update, :destroy] do
    resources :comments, only: [:create]
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", :as => :rails_health_check

  # Defines the root path route ("/")
  root "articles#frontpage", as: :frontpage

  # Authentication routes
  post "login/mastodon", to: "sessions#mastodon", as: :login_mastodon
  # DISABLED: ATProto/Bluesky integration temporarily disabled
  # post "login/bluesky", to: "sessions#bluesky", as: :login_bluesky
  get "auth/mastodon/callback", to: "sessions#create"
  post "auth/mastodon/callback", to: "sessions#create"
  # DISABLED: ATProto/Bluesky integration temporarily disabled
  # get "auth/atproto/callback", to: "sessions#create"
  # post "auth/atproto/callback", to: "sessions#create"
  get "auth/failure", to: "sessions#failure"
  delete "logout", to: "sessions#destroy", as: :logout

  # AT Protocol OAuth client metadata
  # DISABLED: ATProto/Bluesky integration temporarily disabled
  # get "oauth/client-metadata.json", to: "oauth#client_metadata"

  mount Federails::Engine => "/"

  mount PgHero::Engine, at: "pghero"

  mount MissionControl::Jobs::Engine, at: "/jobs"

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
