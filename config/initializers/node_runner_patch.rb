# class NodeRunner
#   def write_to_tempfile(contents)
#     # Use a simple approach: create a file directly
#     work_dir = "/rails/tmp"
#     filename = File.join(work_dir, "node_runner_#{Process.pid}_#{SecureRandom.hex(8)}.js")

#     File.write(filename, contents)

#     # Return a file-like object that Duck-types as needed
#     file = File.open(filename, "r")
#     def file.path
#       @path
#     end
#     file.instance_variable_set(:@path, filename)
#     file
#   end
# end
