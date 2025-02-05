Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  
  resources :sources
  # resources :articles

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  root "articles#frontpage", as: :frontpage

  get 'reader/(:id)', to: 'articles#reader', as: :reader
  post 'fetch_feeds', to: 'sources#fetch_feeds', as: :fetch_feeds
  post 'fetch_feed', to: 'sources#fetch_feed', as: :fetch_feed
  get 'list', to: 'articles#list', as: :list
  get 'search', to: 'articles#search', as: :search
  # some Sources contain a period or some other special character in the name
  get ':source_name', to: 'articles#articles_by_source', 
    constraints: { source_name: /[^\/]+/ }, as: :articles_by_source
  get '/.well-known/webfinger', to: 'federation#webfinger', as: :webfinger
  get '/@(:fediverse_user)', to: 'federation#fediverse_user', as: :fediverse_user
  # get "@aggregator", to: 'federation#fediverse_user'
  get "/@(:fediverse_user)/outbox", to: 'federation#outbox', as: :fediverse_outbox
  post "/@(:fediverse_user)/inbox", to: 'federation#inbox', as: :fediverse_inbox
  get 'following', to: 'federation#following', as: :fediverse_following
  get 'followers', to: 'federation#followers', as: :fediverse_followers
end
