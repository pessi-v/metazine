begin
  tmp_dir = "/tmp/node_runner"
  FileUtils.mkdir_p(tmp_dir) unless Dir.exist?(tmp_dir)
  FileUtils.chmod(0o777, tmp_dir)
rescue => e
  Rails.logger.error "Failed to ensure tmp directory: #{e.message}"
end
