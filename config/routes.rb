Rails.application.routes.draw do
  resources :sources
  resources :articles
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  root "articles#frontpage", as: :frontpage

  
  get 'reader/(:id)', to: 'articles#reader', as: :reader
  post 'fetch_feeds', to: 'sources#fetch_feeds', as: :fetch_feeds
  get 'list', to: 'articles#list', as: :list
end
