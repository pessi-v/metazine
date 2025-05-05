module NodeRunnerPatch
  def create_tempfile(basename)
    # Always use /rails/tmp for temporary files
    work_dir = "/rails/tmp"
    FileUtils.mkdir_p(work_dir) unless File.exist?(work_dir)

    # Generate a unique filename
    prefix = Array(basename).first || "node_runner"
    suffix = Array(basename).last || "js"
    filename = File.join(work_dir, "#{prefix}_#{Process.pid}_#{SecureRandom.hex(8)}.#{suffix}")

    # Create the file with proper permissions
    File.open(filename, File::WRONLY | File::CREAT | File::EXCL, 0o644)
  end
end

NodeRunner.prepend(NodeRunnerPatch)
