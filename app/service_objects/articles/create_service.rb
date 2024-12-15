# frozen_string_literal: true

# Generic article sources RSS job
module Articles
  class CreateService
    def initialize(source, entry)
      @source = source
      @entry = entry
      @ogp = get_ogp
    end

    def create_article
      @title = clean_parentheses(text_cleaner(@entry.title))
      return if Article.where('articles.title = ? OR articles.url = ?', @title, @entry.url).exists?
      return unless detect_language == 'en'
      return if @entry.categories.include?('Video') && !@source.allow_video
      return if (@entry.categories.include?('Podcast') || @entry.categories.include?('Audio')) && !@source.allow_audio

      create_summary
      set_image if @source.show_images

      a = Article.new(
        title: @title,
        description: @ogp.description,
        summary: @summary,
        url: @entry.url,
        source_name: @source.name,
        source_id: @source.id,
        published_at: published_at,
        image_url: @image || nil
      )

      a.save
    end

    def get_ogp
      response = Faraday.get(@entry.url)
      OGP::OpenGraph.new(response.body, required_attributes: [])
    end

    def set_image
      if @ogp&.image&.url.present?
        cleaned_url = asciify(@ogp.image.url)
        return unless cleaned_url
        
        request = Faraday.get(cleaned_url)
        if request.status == 200 && request.headers['content-type']&.match?('image') # Content-type header not always present!
          @image = @ogp.image.url
          return
        end
      end

      if @entry.image.present?
        cleaned_url = asciify(@entry.image)
        return unless cleaned_url

        request = Faraday.get(cleaned_url)
        if request.status == 200 && request.headers['content-type']&.match?('image') # Content-type header not always present!
          @image = @entry.image
          return
        end
      end

      nil
    end

    def create_summary
      text = @entry.summary || @entry.content

      @summary = text.present? ? "#{text_cleaner(text)[0..700]}#{text.length > 700 ? '…' : ''}" : nil
    end

    def clean_parentheses(text)
      if (open_parenthesis = text.rindex('('))
        if (close_parenthesis = text[open_parenthesis..].index(')'))
          text = text[0...open_parenthesis] + text[open_parenthesis + close_parenthesis + 1..]
        else
          return text
        end
        clean_parentheses(text)
      else
        text.squeeze(' ')
      end
    end

    def text_cleaner(text)
      text = text&.force_encoding('utf-8')
      text = ApplicationController.helpers.strip_links text
      text = text.sanitize
      text = ApplicationController.helpers.strip_tags text
      text = CGI.unescapeHTML text
      text.delete!("\t")
      text.delete!("\n")
      text = text.capitalize if text == text.upcase

      # remove head [tag]
      if text[0] == '[' && text.match?(']')
        closure = text.index(']')
        text = text[closure + 1..]
      end

      # remove tail
      if (ellipsis = text.index(/(\[…\]){1}/))
        text = "#{text[0..ellipsis - 1].strip}…"
      elsif (ellipsis = text.index(/…{1}/))
        text = text[0..ellipsis]
      end

      # remove weird spaces
      text = text.squeeze(' ')
      text = text.squeeze('*')
      text = text.gsub(/\&nbsp;/," ")
      
      # add missing whitespace after punctuation
      text = text.gsub(/([,\.!?:;])(\S)/, '\1 \2')

      text.strip

      if text.end_with?('[…]')
        text = remove_last_sentence(text)
      end

      text
    end

    def published_at
      if @entry.published.blank?
        Time.current
      else
        timestamp = Time.zone.parse(@entry.published.to_s)
        timestamp > Time.current ? Time.current : timestamp
      end
    end

    def detect_language
      if @summary.present?
        CLD.detect_language(@summary)[:code]
      else
        CLD.detect_language(@title)[:code]
      end
    end

    private

    def remove_last_sentence(text)
      last_punctuation_index = text.rindex(/[.!?]/)
      text[0..last_punctuation_index]
    end

    def asciify(url)
      uri = Addressable::URI.parse(url)
      uri.normalize
    
    rescue Addressable::URI::InvalidURIError => e
      return nil
    end
  end
end
