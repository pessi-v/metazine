module Federails
  class ApplicationJob < ActiveJob::Base
    discard_on ActiveJob::DeserializationError
    after_discard do |_job, exception|
      Rails.logger.info exception.to_s
    end
  end
end
