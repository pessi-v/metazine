module Articles
  class ReadabilityService
    def initialize(html_content)
      @html_content = html_content

    end

    def parse
      runner = NodeRunner.new(
        <<~JAVASCRIPT
        const { Readability } = require('@mozilla/readability');
        const jsdom = require("jsdom");
        const { JSDOM } = jsdom;        
        const parse = (document) => {
          const dom = new JSDOM(document);
          return new Readability(dom.window.document).parse()
        }
        JAVASCRIPT
      )
      readability_output = runner.parse(@html_content).to_s

      if readability_output['title'].nil?
        readability_output = parse_with_readability_gem
      end

      return readability_output
    end

    # In some cases the Javascript parsing can fail
    def parse_with_readability_gem
      readability_gem_output = Readability::Document.new(@html_content)
      {"title" => readability_gem_output.title,
        "byline" => readability_gem_output.author,
        "dir" => nil,
        "lang" => 'en-US',
        "content" => readability_gem_output.content,
        "textContent" => readability_gem_output.content,
        "length" => readability_gem_output.content.length,
        "excerpt" => nil,
        "siteName" => nil,
        "publishedTime" => nil}
        .to_s
    end
  end
end