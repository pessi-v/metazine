# frozen_string_literal: true

class JobRun < ApplicationRecord
  validates :job_name, presence: true
  validates :started_at, presence: true

  scope :for_job, ->(job_name) { where(job_name: job_name) }
  scope :recent, -> { order(started_at: :desc) }
  scope :successful, -> { where(success: true) }
  scope :failed, -> { where(success: false) }

  def duration
    return nil unless started_at && finished_at
    finished_at - started_at
  end

  def running?
    started_at.present? && finished_at.nil?
  end
end
