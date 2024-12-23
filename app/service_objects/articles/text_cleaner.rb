module Articles
  class TextCleaner
    def initialize(text)
      @text = text
    end

    def clean
      text
        .force_encoding('utf-8')
        .then { |t| strip_formatting(t) }
        .then { |t| remove_special_characters(t) }
        .then { |t| fix_spacing(t) }
        .then { |t| handle_ellipsis(t) }
        .then { |t| remove_head_tag(t) }
        .then { |t| capitalize(t) }
        .strip
    end

    def clean_with_parentheses
      clean_parentheses(clean)
    end

    private

    attr_reader :text

    def strip_formatting(text)
      text = ApplicationController.helpers.strip_links(text)
      text = text.sanitize
      text = ApplicationController.helpers.strip_tags(text)
      CGI.unescapeHTML(text)
    end

    def remove_special_characters(text)
      text.delete("\t").delete("\n")
    end

    def fix_spacing(text)
      text = text.squeeze(' ').squeeze('*')
      text = text.gsub(/\&nbsp;/, " ")
      text.gsub(/([,\.!?:;])(\S)/, '\1 \2')
    end

    def handle_ellipsis(text)
      return remove_last_sentence(text) if text.match?('…')
      text
    end

    def capitalize(text)
      text = text.capitalize if text == text.upcase
      text
    end

    def remove_head_tag(text)
      return text unless text.start_with?('[') && text.match?(']')
      
      closure = text.index(']')
      text[(closure + 1)..]
    end

    def clean_parentheses(text)
      return text unless (open_parenthesis = text.rindex('('))
      return text unless (close_parenthesis = text[open_parenthesis..].index(')'))

      cleaned_text = text[0...open_parenthesis] + text[open_parenthesis + close_parenthesis + 1..]
      clean_parentheses(cleaned_text)
    end

    def remove_last_sentence(text)
      last_punctuation_index = text.rindex(/[.!?]/)
      text[0..last_punctuation_index]
    end
  end
end