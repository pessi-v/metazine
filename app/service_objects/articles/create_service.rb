# frozen_string_literal: true

# Generic article sources RSS job
module Articles
  class CreateService
    # def initialize(source, entry, regions, countries, country_classifier)
    def initialize(source, entry)
      @source = source
      @entry = entry
      @ogp = get_ogp
      # @regions = regions
      # @countries = countries
      # @country_classifier = country_classifier
    end

    def create_article
      @title = clean_parentheses(text_cleaner(@entry.title))
      return if Article.where('articles.title = ? OR articles.url = ?', @title, @entry.url).exists?
      return unless detect_language == 'en'
      return if @entry.categories.include?('Video') && !@source.allow_video
      return if (@entry.categories.include?('Podcast') || @entry.categories.include?('Audio')) && !@source.allow_audio

      create_summary
      # check_og
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
        # user_id: 1,
        # language: set_language,
        # country: set_country,
        # region: set_region,
        # show_image: @source.show_image
      )

      a.save
    end

    def get_ogp
      response = Faraday.get(@entry.url)
      OGP::OpenGraph.new(response.body)
    end

    def set_image
      if @ogp&.image.url.present?
        # cleaned_url = asciify(@ogp.image.url)
        # return unless cleaned_url
        
        # request = Faraday.get(cleaned_url)
        request = Faraday.get(@ogp.image.url)
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

    # def set_country
    #   tagged_countries = (@entry.categories & @countries)

    #   @country =
    #     if tagged_countries.count.zero?
    #       prediction = @country_classifier.predict(@title)
    #       prediction.keys[0] if prediction.values[0] > 0.7
    #     elsif tagged_countries.count == 1
    #       tagged_countries[0]
    #     else
    #       'International'
    #     end
    # end

    # def set_region
    #   if @country == 'International' || @country.nil?
    #     'International'
    #   else
    #     @regions.select { |_key, value| value.include?(@country) }.keys[0]
    #   end
    # end

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

    def asciify(url)
      uri = Addressable::URI.parse(url)
      uri.normalize
    
    rescue Addressable::URI::InvalidURIError => e
      return nil
    end
  end
end
