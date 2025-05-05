module NodeRunnerPatch
  def create_tempfile(basename)
    # Force use of Rails tmp directory
    work_dir = Rails.root.join("tmp", "node_runner_temp")
    FileUtils.mkdir_p(work_dir) unless File.exist?(work_dir)

    filename = File.join(work_dir, "#{basename[0]}_#{SecureRandom.hex(8)}.#{basename[1]}")
    File.open(filename, File::WRONLY | File::CREAT | File::EXCL, 0o644)
  end

  def write_to_tempfile(contents)
    tmpfile = create_tempfile(["node_runner", "js"])
    tmpfile.write(contents)
    tmpfile.close
    tmpfile
  end
end
