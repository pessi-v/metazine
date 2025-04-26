# frozen_string_literal: true

module Articles
  class ReadabilityService
    LOCATION_TAGS = %w[Europe North-America South-America Africa Asia Oceania International Ukraine Palestine USA China].freeze

    TAGS = %w[Theory Analysis Strategy Obituary
              News Interview Socialism Feminism Ecology Climate Labor Justice Activism Parties Protest Solidarity
              History Collapse Decolonization Commons Organizing
              Fascism Democracy Culture Liberation Resources Indigenous Migration Poverty Healthcare Education Housing
              Imperialism Cooperatives Community Strikes Economics Corruption Technology].freeze

    def initialize(html_content)
      @html_content = html_content
    end

    def parse
      readability_output = parse_with_mozilla_readability

      return if readability_output.nil?

      # create tags from textContent
      classifier = Informers.pipeline('zero-shot-classification')
      location_tags = classifier.call(readability_output['textContent'], LOCATION_TAGS)
      tags = classifier.call(readability_output['textContent'], TAGS)
      # binding.break
      readability_output['tags'] = location_tags[:labels][..0]
      readability_output['tags'] += tags[:labels][..1]

      readability_output.delete('textContent')
      # strip whitespace and newlines from in between html elements
      readability_output['content'] = readability_output['content'].gsub(/>\s+</, '><')
      readability_output
    end

    # In some cases the Javascript parsing can fail
    def parse_with_readability_gem
      readability_gem_output = Readability::Document.new(@html_content)
      {'title' => readability_gem_output.title,
       'byline' => readability_gem_output.author,
       'dir' => nil,
       'lang' => 'en-US',
       'content' => readability_gem_output.content,
       # 'textContent' => readability_gem_output.content,
       'length' => readability_gem_output.content.length,
       'excerpt' => nil,
       'siteName' => nil,
       'publishedTime' => nil}
    end

    private

    # this returns a hash
    def parse_with_mozilla_readability
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
    end
  end
end

# TODO: strip links to x.com/twitter.com, maybe facebook.com & instagram.com
