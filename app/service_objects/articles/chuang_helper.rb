module Articles
  class ChuangHelper
    # This is a custom helper for creating Articles, intended to use for https://chuangcn.org
    def initialize(readability_output)
      # binding.break
      @readability_output = readability_output
      @text = readability_output['content']
    end

    def remove_chinese_section
      # Look for common transition patterns between English and Chinese sections
      transition_patterns = [
        /\n\s*Chinese\s*version\s*[:：]\s*\n/i,
        /\n\s*中文版\s*[:：]?\s*\n/,
        /\n\s*Chinese\s*translation\s*[:：]?\s*\n/i,
        /\n{2,}\s*[（(]?\s*以下是中文版本\s*[)）]?\s*\n/
      ]
    
      # Try to find the transition marker
      transition_index = nil
      
      transition_patterns.each do |pattern|
        match = @text.match(pattern)
        if match
          transition_index = match.begin(0)
          break
        end
      end
    
      # If no clear transition marker is found, try to detect based on character density
      if transition_index.nil?
        # Split text into paragraphs
        paragraphs = @text.split(/\n{2,}/)
        
        paragraphs.each_with_index do |para, index|
          # Calculate ratio of Chinese characters in the paragraph
          chinese_char_count = para.scan(/\p{Han}/).size
          total_char_count = para.gsub(/\s+/, '').length
          
          # If paragraph has more than 50% Chinese characters and isn't the title
          # (checking if it's not in the first paragraph)
          if index > 0 && (chinese_char_count.to_f / total_char_count) > 0.5
            transition_index = @text.index(para)
            break
          end
        end
      end
    
      # Return original text if no Chinese section is found
      return @readability_output if transition_index.nil?
      
      # Return only the English section
      edited_readability_output = @readability_output
      edited_readability_output['content'] = @text[0...transition_index].strip
      return edited_readability_output
    end
  end
end