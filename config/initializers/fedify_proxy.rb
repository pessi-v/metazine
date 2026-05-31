require Rails.root.join("lib/fedify_proxy").to_s
Rails.application.config.middleware.use FedifyProxy
