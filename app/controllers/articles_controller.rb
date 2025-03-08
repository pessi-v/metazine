# frozen_string_literal: true

class ArticlesController < ApplicationController
  def frontpage
    @articles = latest_articles.limit(14)
    # @articles = latest_articles
    #   .select(Article.column_names - ['readability_output'])
  end

  def search
    @pagy, @articles = pagy(Article.search_by_title_source_and_readability_output(params[:query])
      .select(Article.column_names - ['readability_output'])
      .reorder('published_at DESC'), limit: 14) # for some reason pagy doesn't like .order
    
    @search_term = params[:query]
    render :list
  end

  def articles_by_source
    @pagy, @articles = pagy(Article.where(source_name: params[:source_name])
      .select(Article.column_names - ['readability_output'])
      .reorder('published_at DESC'), limit: 14) # for some reason pagy doesn't like .order
    @source_name = params[:source_name]
    render :list
  end

  def list
    @list_view = true
    @pagy, @articles = pagy(latest_articles, limit: 20)
  end

  def reader
    @article = Article.find(params[:id])

    set_article_readability_output(@article) unless @article.readability_output

    readability_output = @article.readability_output_jsonb
    if readability_output == '{}'
      readability_output = eval @article.readability_output
    end


    @title = @article.title
    @content = readability_output['content'].gsub('class="page"', '')
    @content = add_image_attributes(@content)

    # @content = readability_output['textContent']
    @text_to_speech_content = prepare_readability_output_for_tts(readability_output)

    # headers['Cross-Origin-Opener-Policy'] = 'same-origin'
    # headers['Cross-Origin-Embedder-Policy'] = 'require-corp'

    respond_to do |format|
      format.html
      format.json { render json: @article }
    end
  end

  private

  def add_image_attributes(html_string)
    # Create a new Nokogiri HTML document
    doc = Nokogiri::HTML(html_string)

    # Find all img tags
    doc.css('img').each do |img|
      # Add class attribute
      existing_classes = img['class']&.split(' ') || []
      new_classes = existing_classes + ['custom-prop-image']
      img['class'] = new_classes.uniq.join(' ')

      # Add data controller attribute
      img['data-controller'] = 'reader-image'
    end

    # Return the modified HTML as a string
    doc.to_html
  end

  # def add_crossorigin_to_images(content)
  #   # Parse the HTML content
  #   doc = Nokogiri::HTML(content)

  #   # Find all img tags
  #   doc.css('img').each do |img|
  #     # Add crossorigin attribute if it doesn't exist
  #     unless img.has_attribute?('crossorigin')
  #       img['crossorigin'] = 'anonymous'
  #     end
  #   end

  #   # Return the modified HTML
  #   doc.to_html
  # end

  def latest_articles
    # @pagy, @articles = pagy(Article.order(published_at: :desc)
    #   .select(Article.column_names - ['readability_output']), limit: 14)
    Article
      .select(Article.column_names - ['readability_output'])
      .reorder('published_at DESC') # for some reason pagy doesn't like .order
  end

  # TODO: remove after a few days (1.2.25)
  def set_article_readability_output(article)
    response = Faraday.get(article.url)
    article.readability_output = Articles::ReadabilityService.new(response.body).parse
    article.save
  end

  # Only allow a list of trusted parameters through.
  def article_params
    params.require(:article).permit(:title, :image_url, :url, :preview_text, :allow_video, :allow_audio)
  end

  def prepare_readability_output_for_tts(readability_output)
    # Processes HTML content to make it suitable for text-to-speech (TTS) conversion by:
    #
    # 1. Extracting text content from:
    #    - <p> and header tags (<h1>, <h2>, etc.)
    #    - Unordered lists (<ul>) and their list items (<li>)
    #    - Ordered lists (<ol>) and their list items (<li>)
    #    - The .*? pattern ensures minimal matching for nested tags
    #    - The /m flag allows matching across multiple lines
    #
    # 2. For each extracted text block, performing these transformations:
    #    - Strips any remaining HTML tags (including <em> within list items)
    #    - Removes tilde (~) characters
    #    - Removes escaped characters like \n or \t
    #    - Converts HTML entities (like &amp;) to spaces
    #    - Converts Unicode hex codes (\u0123) to spaces
    #    - Makes parenthetical content more TTS-friendly by adding commas
    #    - Makes quoted text more explicit for TTS
    #    - Ensures each block ends with proper sentence punctuation
    #    - Adds "Summary:" before and "End of summary." after unordered lists
    #
    # Returns a JSON string of clean, TTS-optimized text blocks
    #
    # TODO: when this is well refined, make a new attribute where this text is stored

    content = readability_output['content']
    blocks = []

    # Remove tooltip spans and sup tags before processing other content
    content = content
              .gsub(%r{<span[^>]*role="tooltip"[^>]*>.*?</span>}m, '')
    # .gsub(/<sup>(?:(?!<\/sup>).)*?<a[^>]*>(?:(?!<\/sup>).)*?<\/a>(?:(?!<\/sup>).)*?<\/sup>/m, '')  # TODO: this doesn't seem to work (the intent was to remove superscipts)

    def process_string(item)
      item
        .gsub(%r{</?[^>]*>}, '') # Remove leftover tags (including <em>)
        .delete('~') # Remove tildes
        .gsub(/\\[a-z]/, '')               # Remove escaped characters
        .gsub(/&[a-z]+;/, ' ')             # Replace HTML entities with space
        .gsub(/\\u[0-9a-fA-F]{4}/, ' ')    # Replace hex codes with space
        .gsub(/\((.*?)\)/) { |_match| ", #{::Regexp.last_match(1)}, " } # Add commas around parenthetical content
        .gsub(/“(.*?)”/) { |_match| ", quote, #{::Regexp.last_match(1)}, end quote, " }  # Make quotations explicitly readable
        .gsub(/"(.*?)"/) { |_match| ", quote, #{::Regexp.last_match(1)}, end quote, " }  # Make quotations explicitly readable
        .strip
        .gsub(/(?<![.!?])$/, '.')
    end

    # Process the content in order of appearance
    content.scan(%r{<(?:p|h\d+|ul|ol)>(.*?)</(?:p|h\d+|ul|ol)>}m).flatten.each do |block|
      if block.include?('<li>')
        if block.match?(/<ol/)
          # Process ordered list items with their index
          index = 1
          block.scan(%r{<li>(.*?)</li>}m).flatten.each do |item|
            # Add the index as a separate block
            blocks << "Number #{index}."

            blocks << process_string(item)
            index += 1
          end
        else
          # Handle unordered lists
          # TODO: Some Content has a <ul> tag for each <li> element (!)
          blocks << 'Summary:'

          block.scan(%r{<li>(.*?)</li>}m).flatten.each do |item|
            blocks << process_string(item)
          end

          blocks << 'End of summary.'
        end
      else
        # Process regular paragraphs and headers
        blocks << process_string(block)
      end
    end

    # Add title at the beginning
    blocks.unshift(@title)
    blocks.to_json
  end
end
