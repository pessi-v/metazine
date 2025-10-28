# Override federails signing to use instance actor for remote users
require 'fediverse/notifier'

Rails.application.config.to_prepare do
  Fediverse::Notifier.singleton_class.prepend(Module.new do
    private

    def signed_request(to:, message:, from:)
      req = request(to: to, message: message)

      if from
        # If the actor is remote (has no private key), sign with instance actor
        signing_actor = if from.distant? || from.private_key.blank?
          Rails.logger.info "  Using instance actor to sign request (actor #{from.username}@#{from.server} is remote)"
          instance_actor = InstanceActor.first&.federails_actor

          unless instance_actor
            Rails.logger.error "  No instance actor found! Cannot sign request."
            return req
          end

          unless instance_actor.private_key.present?
            Rails.logger.error "  Instance actor has no private key! Cannot sign request."
            return req
          end

          instance_actor
        else
          from
        end

        req.headers['Signature'] = Fediverse::Signature.sign(sender: signing_actor, request: req)
      end

      req
    end
  end)
end
