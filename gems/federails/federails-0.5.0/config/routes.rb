Federails::Engine.routes.draw do
  if Federails.configuration.enable_discovery
    scope path: '/' do
      get '/.well-known/webfinger', to: 'server/web_finger#find', as: :webfinger
      get '/.well-known/host-meta', to: 'server/web_finger#host_meta', as: :host_meta
      get '/.well-known/nodeinfo', to: 'server/nodeinfo#index', as: :node_info
      get '/nodeinfo/2.0', to: 'server/nodeinfo#show', as: :show_node_info
    end
  end

  if Federails.configuration.client_routes_path
    scope Federails.configuration.client_routes_path, module: :client, as: :client do
      resources :activities, only: [:index] do
        collection do
          get :feed, to: 'activities#feed'
        end
      end
      resources :actors, only: [:index, :show] do
        collection do
          get :lookup, to: 'actors#lookup'
        end
        resources :activities, only: [:index]
      end
      get :feed, to: 'activities#feed'
      resources :followings, only: [:new, :create, :destroy] do
        collection do
          post :follow, to: 'followings#follow'
        end

        member do
          put :accept, to: 'followings#accept'
        end
      end
    end
  end

  scope Federails.configuration.server_routes_path, module: :server, as: :server, defaults: { format: :activitypub } do
    resources :actors, only: [:show] do
      member do
        get :followers
        get :following
      end
      get :outbox, to: 'activities#outbox'
      post :inbox, to: 'activities#create'
      resources :activities, only: [:show]
      resources :followings, only: [:show]
    end

    scope :published do
      get ':publishable_type/:id', to: 'published#show', as: :published
    end
  end
end
