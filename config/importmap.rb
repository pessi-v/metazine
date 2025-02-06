# frozen_string_literal: true

# Pin npm packages by running ./bin/importmap

pin 'application'
pin '@hotwired/turbo-rails', to: 'turbo.min.js'
pin '@hotwired/stimulus', to: 'stimulus.min.js'
pin '@hotwired/stimulus-loading', to: 'stimulus-loading.js'
pin_all_from 'app/javascript/controllers', under: 'controllers'
pin '@rails/request.js', to: '@rails--request.js.js' # @0.0.9
# pin "@diffusionstudio/vits-web", to: "@diffusionstudio--vits-web.js" # @1.0.3
pin 'onnxruntime-web' # @1.18.0
pin 'piper'
pin 'piper_worker'
pin '@mintplex-labs--piper-tts-web'
