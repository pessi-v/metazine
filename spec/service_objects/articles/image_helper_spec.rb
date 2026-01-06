require "rails_helper"

RSpec.describe Articles::ImageHelper do
  describe ".remove_small_images" do
    let(:article) { build(:article) }

    context "with no content" do
      before do
        article.readability_output_jsonb = nil
      end

      it "returns the article unchanged" do
        result = described_class.remove_small_images(article)
        expect(result).to eq(article)
      end
    end

    context "with content but no images" do
      before do
        article.readability_output_jsonb = {
          "content" => "<p>This is text without images</p>"
        }
      end

      it "returns the article unchanged" do
        result = described_class.remove_small_images(article)
        expect(result.readability_output_jsonb["content"]).to eq("<p>This is text without images</p>")
      end
    end

    context "with small image (< 250px wide)" do
      let(:small_image_url) { "https://example.com/small.png" }

      before do
        article.readability_output_jsonb = {
          "content" => "<p>Text before</p><img src=\"#{small_image_url}\"><p>Text after</p>"
        }

        # Stub FastImage to return small dimensions (56x125 like the carrot image)
        allow(FastImage).to receive(:size).with(small_image_url).and_return([56, 125])
      end

      it "removes the small image" do
        result = described_class.remove_small_images(article)
        expect(result.readability_output_jsonb["content"]).not_to include("<img")
        expect(result.readability_output_jsonb["content"]).to include("Text before")
        expect(result.readability_output_jsonb["content"]).to include("Text after")
      end

      it "logs the removal" do
        expect(Rails.logger).to receive(:info).with(/Removing small image \(56x125\)/)
        described_class.remove_small_images(article)
      end
    end

    context "with small image wrapped in figure tag" do
      let(:small_image_url) { "https://example.com/logo.png" }

      before do
        article.readability_output_jsonb = {
          "content" => "<p>Text before</p><figure><img src=\"#{small_image_url}\"><figcaption>Logo</figcaption></figure><p>Text after</p>"
        }

        allow(FastImage).to receive(:size).with(small_image_url).and_return([100, 50])
      end

      it "removes the entire figure element" do
        result = described_class.remove_small_images(article)
        expect(result.readability_output_jsonb["content"]).not_to include("<figure")
        expect(result.readability_output_jsonb["content"]).not_to include("<img")
        expect(result.readability_output_jsonb["content"]).not_to include("Logo")
      end
    end

    context "with large image (>= 250px wide)" do
      let(:large_image_url) { "https://example.com/large.jpg" }

      before do
        article.readability_output_jsonb = {
          "content" => "<p>Text before</p><img src=\"#{large_image_url}\"><p>Text after</p>"
        }

        allow(FastImage).to receive(:size).with(large_image_url).and_return([800, 600])
      end

      it "keeps the large image" do
        result = described_class.remove_small_images(article)
        expect(result.readability_output_jsonb["content"]).to include("<img")
        expect(result.readability_output_jsonb["content"]).to include(large_image_url)
      end
    end

    context "with image exactly 250px wide" do
      let(:image_url) { "https://example.com/borderline.png" }

      before do
        article.readability_output_jsonb = {
          "content" => "<img src=\"#{image_url}\">"
        }

        allow(FastImage).to receive(:size).with(image_url).and_return([250, 200])
      end

      it "keeps the image (threshold is < 250)" do
        result = described_class.remove_small_images(article)
        expect(result.readability_output_jsonb["content"]).to include("<img")
      end
    end

    context "with image exactly 249px wide" do
      let(:image_url) { "https://example.com/just-small.png" }

      before do
        article.readability_output_jsonb = {
          "content" => "<img src=\"#{image_url}\">"
        }

        allow(FastImage).to receive(:size).with(image_url).and_return([249, 200])
      end

      it "removes the image" do
        result = described_class.remove_small_images(article)
        expect(result.readability_output_jsonb["content"]).not_to include("<img")
      end
    end

    context "with mixed small and large images" do
      let(:small_image_url) { "https://example.com/small.png" }
      let(:large_image_url) { "https://example.com/large.jpg" }

      before do
        article.readability_output_jsonb = {
          "content" => "<p>Text</p><img src=\"#{small_image_url}\"><p>More text</p><img src=\"#{large_image_url}\"><p>End</p>"
        }

        allow(FastImage).to receive(:size).with(small_image_url).and_return([100, 100])
        allow(FastImage).to receive(:size).with(large_image_url).and_return([800, 600])
      end

      it "removes only small images" do
        result = described_class.remove_small_images(article)
        expect(result.readability_output_jsonb["content"]).not_to include(small_image_url)
        expect(result.readability_output_jsonb["content"]).to include(large_image_url)
      end
    end

    context "when FastImage fails to get dimensions" do
      let(:image_url) { "https://example.com/unreachable.png" }

      before do
        article.readability_output_jsonb = {
          "content" => "<img src=\"#{image_url}\">"
        }

        allow(FastImage).to receive(:size).with(image_url).and_raise(StandardError.new("Connection failed"))
      end

      it "keeps the image and logs the error" do
        expect(Rails.logger).to receive(:info).with(/Could not check image dimensions/)
        result = described_class.remove_small_images(article)
        expect(result.readability_output_jsonb["content"]).to include("<img")
      end
    end

    context "when FastImage returns nil" do
      let(:image_url) { "https://example.com/invalid.png" }

      before do
        article.readability_output_jsonb = {
          "content" => "<img src=\"#{image_url}\">"
        }

        allow(FastImage).to receive(:size).with(image_url).and_return(nil)
      end

      it "keeps the image" do
        result = described_class.remove_small_images(article)
        expect(result.readability_output_jsonb["content"]).to include("<img")
      end
    end

    context "with image tag without src attribute" do
      before do
        article.readability_output_jsonb = {
          "content" => "<img alt=\"Broken image\">"
        }
      end

      it "keeps the image tag unchanged" do
        result = described_class.remove_small_images(article)
        expect(result.readability_output_jsonb["content"]).to include("<img")
      end
    end

    context "with multiple small images" do
      let(:small_image_1) { "https://example.com/small1.png" }
      let(:small_image_2) { "https://example.com/small2.png" }
      let(:small_image_3) { "https://example.com/small3.png" }

      before do
        article.readability_output_jsonb = {
          "content" => "<p>Text</p><img src=\"#{small_image_1}\"><img src=\"#{small_image_2}\"><img src=\"#{small_image_3}\"><p>End</p>"
        }

        allow(FastImage).to receive(:size).with(small_image_1).and_return([50, 50])
        allow(FastImage).to receive(:size).with(small_image_2).and_return([100, 100])
        allow(FastImage).to receive(:size).with(small_image_3).and_return([150, 150])
      end

      it "removes all small images" do
        result = described_class.remove_small_images(article)
        expect(result.readability_output_jsonb["content"]).not_to include("<img")
        expect(result.readability_output_jsonb["content"]).to include("Text")
        expect(result.readability_output_jsonb["content"]).to include("End")
      end
    end
  end

  describe ".compare_and_update_article_images" do
    # Existing tests for compare_and_update_article_images can go here
    # We're not modifying that functionality, so keeping this placeholder
  end
end
