# frozen_string_literal: true

module Articles
  class TextCleaner
    def initialize(text)
      @text = text
    end

    def clean_title
      title = clean_parentheses(clean)

      # if it's a long title and contains a dash,
      # the latter part can probably be edited out safely
      title = title.split(/\s[\u2014\u2013-]\s/, 2).first if title.length > 100 && title.match?(" - ")

      title
    end

    def clean
      text
        .force_encoding("utf-8")
        .then { |t| strip_formatting(t) }
        .then { |t| remove_special_characters(t) }
        .then { |t| fix_spacing(t) }
        .then { |t| handle_ellipsis(t) }
        .then { |t| remove_head_tag(t) }
        .then { |t| t.gsub(/[\u4e00-\u9fff《》]/, "") } # Remove Chinese characters and brackets
        .then { |t| capitalize(t) }
        .strip
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

    # def fix_spacing(text)
    #   text = text.squeeze(' ').squeeze('*')
    #   text = text.gsub(/\&nbsp;/, " ")
    #   text.gsub(/([,\.!?:;])(\S)/, '\1 \2')
    # end

    # Normalizes text spacing by:
    # 1. Removing duplicate spaces and asterisks
    # 2. Converting HTML non-breaking spaces to regular spaces
    # 3. Adding spaces after punctuation marks
    def fix_spacing(text)
      text = text.squeeze(" ").squeeze("*")
      text = text.gsub("&nbsp;", " ")
      # Only add spaces after punctuation when:
      # - For periods: not preceded by a period (for acronyms) and not between digits
      # - For commas: not between digits
      # - Always add space after other punctuation marks
      text.gsub(/([!?:;]|(?<!\.|\d)\.|(?<!\d),(?!\d))(\S)/, '\1 \2')
    end

    def handle_ellipsis(text)
      return remove_last_sentence(text) if text.match?("\u2026")

      text
    end

    def capitalize(text)
      text = text.capitalize if text == text.upcase
      text
    end

    def remove_head_tag(text)
      return text unless text.start_with?("[") && text.match?("]")

      closure = text.index("]")
      text[(closure + 1)..]
    end

    def clean_parentheses(text)
      text = clean_brackets(text)
      return text unless (open_parenthesis = text.rindex("("))
      return text unless (close_parenthesis = text[open_parenthesis..].index(")"))

      cleaned_text = text[0...open_parenthesis] + text[open_parenthesis + close_parenthesis + 1..]
      clean_parentheses(cleaned_text)
    end

    def clean_brackets(text)
      return text unless (open_bracket = text.rindex("["))
      return text unless (close_bracket = text[open_bracket..].index("]"))

      cleaned_text = text[0...open_bracket] + text[open_bracket + close_bracket + 1..]
      clean_brackets(cleaned_text)
    end

    def remove_last_sentence(text)
      last_punctuation_index = text.rindex(/[.!?]/)
      text[0..last_punctuation_index]
    end
  end
end
