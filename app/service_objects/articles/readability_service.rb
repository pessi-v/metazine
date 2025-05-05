# frozen_string_literal: true

module Articles
  class ReadabilityService
    def initialize(html_content)
      @html_content = html_content
    end

    def parse
      readability_output = parse_with_mozilla_readability

      return if readability_output.nil?

      readability_output.delete("textContent")
      # strip whitespace and newlines from in between html elements
      readability_output["content"] = readability_output["content"].gsub(/>\s+</, "><")
      readability_output
    end

    # In some cases the Javascript parsing can fail
    def parse_with_readability_gem
      readability_gem_output = Readability::Document.new(@html_content)
      {"title" => readability_gem_output.title,
       "byline" => readability_gem_output.author,
       "dir" => nil,
       "lang" => "en-US",
       "content" => readability_gem_output.content,
       # 'textContent' => readability_gem_output.content,
       "length" => readability_gem_output.content.length,
       "excerpt" => nil,
       "siteName" => nil,
       "publishedTime" => nil}
    end

    private

    # this returns a hash
    # def parse_with_mozilla_readability
    #   temp_dir = Rails.root.join("tmp")
    #   FileUtils.mkdir_p(temp_dir) unless File.exist?(temp_dir)

    #   runner = NodeRunner.new(
    #     <<~JAVASCRIPT
    #       const { Readability } = require('@mozilla/readability');
    #       const jsdom = require("jsdom");
    #       const { JSDOM } = jsdom;#{"        "}
    #       const parse = (document) => {
    #         const dom = new JSDOM(document);
    #         return new Readability(dom.window.document).parse()
    #       }
    #     JAVASCRIPT
    #   )

    #   # Set the temporary directory for this process
    #   Dir.mktmpdir(nil, temp_dir) do |tmpdir|
    #     runner.parse(@html_content)
    #   end
    # end
    #
    # def parse_with_mozilla_readability
    #   temp_dir = Rails.root.join("tmp", "readability")
    #   FileUtils.mkdir_p(temp_dir) unless File.exist?(temp_dir)

    #   # Ensure the directory has proper permissions
    #   begin
    #     FileUtils.chmod(0o777, temp_dir)
    #   rescue
    #     nil
    #   end

    #   # Set environment variables before creating NodeRunner
    #   original_tmpdir = ENV["TMPDIR"]
    #   ENV["TMPDIR"] = temp_dir.to_s
    #   ENV["TMP"] = temp_dir.to_s
    #   ENV["TEMP"] = temp_dir.to_s

    #   runner = NodeRunner.new(
    #     <<~JAVASCRIPT
    #       const { Readability } = require('@mozilla/readability');
    #       const jsdom = require("jsdom");
    #       const { JSDOM } = jsdom;#{"        "}
    #       const parse = (document) => {
    #         const dom = new JSDOM(document);
    #         return new Readability(dom.window.document).parse()
    #       }
    #     JAVASCRIPT
    #   )

    #   Dir.mktmpdir("readability_", temp_dir) do |tmpdir|
    #     # Also set the specific tmpdir for this block
    #     Dir.chdir(tmpdir) do
    #       runner.parse(@html_content)
    #     end
    #   end
    # ensure
    #   # Restore original environment variables
    #   ENV["TMPDIR"] = original_tmpdir
    #   ENV["TMP"] = nil
    #   ENV["TEMP"] = nil
    # end
    #
    def parse_with_mozilla_readability
      temp_dir = Rails.root.join("tmp")
      FileUtils.mkdir_p(temp_dir) unless File.exist?(temp_dir)
      begin
        FileUtils.chmod(0o777, temp_dir)
      rescue
        nil
      end

      # Pass a custom executor to NodeRunner with a different temp directory approach
      custom_executor = NodeRunner::Executor.new

      # Override the create_tempfile behavior
      class << custom_executor
        attr_accessor :temp_dir

        # Override the tmpfile creation to use our temp directory
        def create_tempfile(basename)
          tmpfile = nil
          File.open(File.join(temp_dir, "node_runner_#{SecureRandom.hex(8)}.js"), File::WRONLY | File::CREAT | File::EXCL) do |file|
            tmpfile = file
          end
          tmpfile
        end
      end

      custom_executor.temp_dir = temp_dir

      js_string = <<~JAVASCRIPT
        const { Readability } = require("@mozilla/readability");
        const jsdom = require("jsdom");
        const { JSDOM } = jsdom;#{"        "}
        const parse = (document) => {
          const dom = new JSDOM(document);
          return new Readability(dom.window.document).parse()
        }
      JAVASCRIPT

      runner = NodeRunner.new(js_string,
        executor: custom_executor)

      runner.parse(@html_content)
    end
  end
end

# TODO: strip links to x.com/twitter.com, maybe facebook.com & instagram.com
