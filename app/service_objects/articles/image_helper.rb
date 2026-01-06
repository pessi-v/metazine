module Articles
  class ImageHelper
    def self.remove_small_images(article)
      require "fastimage"
      require "nokogiri"

      # Parse the readability content
      content = article.readability_output_jsonb&.dig("content")
      return article unless content.present?

      # Parse HTML content
      doc = Nokogiri::HTML(content)
      images_to_remove = []

      # Find all images in the content
      doc.css("img").each do |img|
        img_src = img["src"]
        next unless img_src.present?

        begin
          # Get image dimensions using FastImage
          size = FastImage.size(img_src)

          if size
            width, height = size

            # Remove images smaller than 250px wide (matching the JS logic)
            if width < 250
              Rails.logger.info("Removing small image (#{width}x#{height}): #{img_src}")
              images_to_remove << img
            end
          end
        rescue => e
          # If we can't fetch the image, log but don't fail
          Rails.logger.info("Could not check image dimensions for #{img_src}: #{e.message}")
        end
      end

      # Remove small images
      images_to_remove.each do |img|
        parent_element = img.parent

        # If the image is wrapped in a figure tag, remove the entire figure
        if parent_element.name.downcase == "figure"
          parent_element.remove
        else
          # Otherwise just remove the image
          img.remove
        end
      end

      # Update the article's content with the modified HTML if any images were removed
      if images_to_remove.any?
        article.readability_output_jsonb["content"] = doc.to_html
      end

      article
    end

    def self.compare_and_update_article_images(article)
      require "dhash-vips"
      require "open-uri"
      require "nokogiri"
      require "tempfile"

      # Check if article has an image_url
      return article unless article.image_url.present?

      # Check if image_url points to an image file and extract format
      image_url = article.image_url
      format = nil

      if image_url =~ /\.(jpg|jpeg|png|webp)$/i
        format = $1.downcase
      else
        return article
      end

      # Parse the readability content to find images
      content = article.readability_output_jsonb&.dig("content")
      return article unless content.present?

      # Parse HTML content
      doc = Nokogiri::HTML(content)

      # Find the first image of the same format in the content
      content_images = doc.css("img").select do |img|
        img["src"].present? && img["src"] =~ /\.#{format}($|\?)/i
      end

      return article if content_images.empty?

      content_image = content_images.first
      content_image_url = content_image["src"]

      # Download both images to temporary files for comparison
      begin
        temp_article_image = Tempfile.new(["article_image", ".#{format}"])
        temp_content_image = Tempfile.new(["content_image", ".#{format}"])

        # Download images - using OpenURI correctly
        File.binwrite(temp_article_image.path, URI.parse(image_url).open.read)

        File.binwrite(temp_content_image.path, URI.parse(content_image_url).open.read)

        # Compare images using dhash-vips
        article_hash = DHashVips::DHash.calculate(temp_article_image.path)
        content_hash = DHashVips::DHash.calculate(temp_content_image.path)

        # Calculate Hamming distance between the hashes
        hamming_distance = DHashVips::DHash.hamming(article_hash, content_hash)
        threshold = 10  # Adjust threshold as needed

        # If images are similar, remove the image element from content
        if hamming_distance < threshold
          # Find the containing element (likely a figure) and remove it
          parent_element = content_image.parent

          # If the image is wrapped in a figure tag, remove the entire figure
          if parent_element.name.downcase == "figure"
            parent_element.remove
          else
            # Otherwise just remove the image
            content_image.remove
          end

          # Update the article's content with the modified HTML
          article.readability_output_jsonb["content"] = doc.to_html
        end
      rescue => e
        Rails.logger.info("Error comparing images: #{e.message}")
      ensure
        # Clean up temp files
        temp_article_image.unlink if temp_article_image && File.exist?(temp_article_image.path)
        temp_content_image.unlink if temp_content_image && File.exist?(temp_content_image.path)
      end

      # Return the potentially modified article
      article
    end
  end
end
