Rails.application.configure do
  MissionControl::Jobs.http_basic_auth_user = ENV["JOBS_QUEUE_USER"]
  MissionControl::Jobs.http_basic_auth_password = ENV["JOBS_QUEUE_PASSWORD"]
end
