module Articles
  class Readability
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
      runner.parse @html_content
    end
  end
end