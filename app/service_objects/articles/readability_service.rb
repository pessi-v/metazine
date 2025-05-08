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
    def parse_with_mozilla_readability
      # Log the environment
      Rails.logger.info "Current user: #{`whoami`.strip}"
      Rails.logger.info "Temp directory permissions: #{`ls -la /tmp`.strip}"
      Rails.logger.info "Process ID: #{Process.pid}"

      runner = NodeRunner.new(
        <<~JAVASCRIPT
          const { Readability } = require('@mozilla/readability');
          const jsdom = require("jsdom");
          const { JSDOM } = jsdom;#{"        "}
          const parse = (document) => {
            const dom = new JSDOM(document);
            return new Readability(dom.window.document).parse()
          }
        JAVASCRIPT
      )

      runner.parse(@html_content)
    rescue => e
      Rails.logger.error "Error in parse_with_mozilla_readability: #{e.class} - #{e.message}"
      Rails.logger.error "Backtrace: #{e.backtrace.join("\n")}"
      raise
    end
  end
end

# TODO: strip links to x.com/twitter.com, maybe facebook.com & instagram.com
