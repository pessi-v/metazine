require "rails_helper"

RSpec.describe Articles::CreateService do
  let(:source) { create(:source, name: "Test Source", show_images: true, allow_video: true, allow_audio: true) }
  let!(:instance_actor) { create(:federails_actor, entity_type: "InstanceActor") }

  let(:entry) do
    double(
      "Entry",
      title: "Test Article Title",
      url: "https://example.com/article",
      summary: "This is a test article summary",
      content: "This is the full article content with more details",
      published: Time.current - 1.day,
      categories: [],
      image: nil
    )
  end

  let(:html_response) do
    <<~HTML
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="Test Article">
          <meta property="og:description" content="Test description from OG tags">
          <meta property="og:image" content="https://example.com/og-image.jpg">
        </head>
        <body>
          <h1>Test Article</h1>
          <p>This is the article content.</p>
        </body>
      </html>
    HTML
  end

  before do
    # Stub the HTTP request to fetch the original page
    stub_request(:get, entry.url)
      .to_return(status: 200, body: html_response, headers: { "Content-Type" => "text/html" })

    # Stub image fetches that might happen during ImageFinder operations
    stub_request(:get, /example\.com.*\.(jpg|png|jpeg|gif)/)
      .to_return(status: 200, body: "", headers: { "Content-Type" => "image/jpeg" })
  end

  describe "#initialize" do
    it "sets up instance variables" do
      service = described_class.new(source, entry)

      expect(service.instance_variable_get(:@source)).to eq(source)
      expect(service.instance_variable_get(:@entry)).to eq(entry)
      expect(service.instance_variable_get(:@cloudflare_blocked)).to be false
    end

    it "fetches the original page" do
      service = described_class.new(source, entry)
      original_page = service.instance_variable_get(:@original_page)

      expect(original_page).to be_present
      expect(original_page.status).to eq(200)
    end

    it "creates a description" do
      service = described_class.new(source, entry)
      description = service.instance_variable_get(:@description)

      expect(description).to be_present
    end

    it "cleans the title" do
      allow(Articles::TextCleaner).to receive(:clean_title).and_return("Cleaned Title")
      service = described_class.new(source, entry)
      clean_title = service.instance_variable_get(:@clean_title)

      expect(clean_title).to eq("Cleaned Title")
      expect(Articles::TextCleaner).to have_received(:clean_title).with(entry.title)
    end
  end

  describe "#cloudflare_blocked?" do
    it "returns false when not blocked" do
      service = described_class.new(source, entry)
      expect(service.cloudflare_blocked?).to be false
    end

    context "when Cloudflare challenge is detected" do
      before do
        stub_request(:get, entry.url)
          .to_return(status: 403, body: "<html><title>Just a moment...</title></html>")

        allow(Articles::CloudflareDetector).to receive(:is_cloudflare_challenge?).and_return(true)
      end

      it "returns true when blocked" do
        service = described_class.new(source, entry)
        expect(service.cloudflare_blocked?).to be true
      end
    end
  end

  describe "#create_article" do
    before do
      allow(Articles::TextCleaner).to receive(:clean_title).and_return("Cleaned Title")
      allow(Articles::TextCleaner).to receive(:clean_description).and_return("Cleaned description")
      allow(Articles::ApprovalHelper).to receive_message_chain(:new, :approve?).and_return(true)
      allow(Articles::ImageHelper).to receive(:compare_and_update_article_images).and_return(Article.new)
      allow(Articles::ImageHelper).to receive(:remove_small_images).and_return(Article.new)
      allow(Articles::ReadabilityService).to receive_message_chain(:new, :parse).and_return({
        "title" => "Article",
        "content" => "<p>Content</p>"
      })
    end

    context "when original page is not fetched" do
      before do
        # Cloudflare blocks the request, setting @original_page to false
        stub_request(:get, entry.url)
          .to_return(status: 403, body: "<html><title>Just a moment...</title></html>")
        allow(Articles::CloudflareDetector).to receive(:is_cloudflare_challenge?).and_return(true)
      end

      it "returns nil" do
        service = described_class.new(source, entry)
        expect(service.create_article).to be_nil
      end
    end

    context "when article already exists by title" do
      before do
        allow(Articles::TextCleaner).to receive(:clean_title).and_return("Existing Article")
        create(:article, title: "Existing Article")
      end

      it "returns nil" do
        service = described_class.new(source, entry)
        expect(service.create_article).to be_nil
      end
    end

    context "when article already exists by URL" do
      before do
        create(:article, url: entry.url)
      end

      it "returns nil" do
        service = described_class.new(source, entry)
        expect(service.create_article).to be_nil
      end
    end

    context "when content is not in English" do
      before do
        allow(CLD).to receive(:detect_language).and_return({ code: "es" })
      end

      it "returns nil" do
        service = described_class.new(source, entry)
        expect(service.create_article).to be_nil
      end
    end

    context "when media type is not allowed" do
      let(:video_entry) do
        double(
          "Entry",
          title: "Video Article",
          url: "https://example.com/video",
          summary: "Video content",
          content: "Video article",
          published: Time.current,
          categories: ["Video"],
          image: nil
        )
      end

      let(:video_source) { create(:source, allow_video: false) }

      before do
        stub_request(:get, video_entry.url)
          .to_return(status: 200, body: html_response)
      end

      it "returns nil" do
        service = described_class.new(video_source, video_entry)
        expect(service.create_article).to be_nil
      end
    end

    context "when approval helper rejects" do
      before do
        allow(Articles::ApprovalHelper).to receive_message_chain(:new, :approve?).and_return(false)
      end

      it "returns nil" do
        service = described_class.new(source, entry)
        expect(service.create_article).to be_nil
      end
    end

    context "with valid article" do
      before do
        allow(CLD).to receive(:detect_language).and_return({ code: "en" })
      end

      it "creates an article object and attempts to save it" do
        allow(CLD).to receive(:detect_language).and_return({ code: "en" })

        service = described_class.new(source, entry)

        # Stub ImageHelper to return article unchanged and stub save
        allow(Articles::ImageHelper).to receive(:compare_and_update_article_images) do |article|
          article
        end
        allow(Articles::ImageHelper).to receive(:remove_small_images) do |article|
          allow(article).to receive(:save).and_return(true)
          article
        end

        article = service.create_article

        expect(article).to be_an(Article)
        expect(article.title).to be_present
        expect(article.description).to be_present
        expect(article.source_id).to eq(source.id)
      end

      it "sets article attributes correctly" do
        allow(CLD).to receive(:detect_language).and_return({ code: "en" })
        allow(Articles::TextCleaner).to receive(:clean_title).and_return("Clean Test Title")
        allow(Articles::TextCleaner).to receive(:clean_description).and_return("Clean description")

        service = described_class.new(source, entry)

        # Don't save, just check the attributes are set correctly
        allow(Articles::ImageHelper).to receive(:compare_and_update_article_images) do |article|
          expect(article.title).to eq("Clean Test Title")
          expect(article.description).to eq("Clean description")
          expect(article.url).to eq(entry.url)
          expect(article.source_name).to eq(source.name)
          expect(article.source_id).to eq(source.id)
          expect(article.federails_actor).to eq(instance_actor)
          article
        end
        allow(Articles::ImageHelper).to receive(:remove_small_images) do |article|
          article
        end

        service.create_article
      end

      it "calls ImageHelper to compare images" do
        allow(CLD).to receive(:detect_language).and_return({ code: "en" })
        service = described_class.new(source, entry)

        expect(Articles::ImageHelper).to receive(:compare_and_update_article_images).and_call_original
        expect(Articles::ImageHelper).to receive(:remove_small_images).and_call_original
        service.create_article
      end

      it "calls ImageHelper to remove small images" do
        allow(CLD).to receive(:detect_language).and_return({ code: "en" })
        service = described_class.new(source, entry)

        allow(Articles::ImageHelper).to receive(:compare_and_update_article_images) do |article|
          article
        end

        expect(Articles::ImageHelper).to receive(:remove_small_images) do |article|
          allow(article).to receive(:save).and_return(true)
          article
        end

        service.create_article
      end

      it "removes small images after comparing duplicate images" do
        allow(CLD).to receive(:detect_language).and_return({ code: "en" })
        service = described_class.new(source, entry)
        call_order = []

        allow(Articles::ImageHelper).to receive(:compare_and_update_article_images) do |article|
          call_order << :compare_images
          article
        end

        allow(Articles::ImageHelper).to receive(:remove_small_images) do |article|
          call_order << :remove_small_images
          allow(article).to receive(:save).and_return(true)
          article
        end

        service.create_article
        expect(call_order).to eq([:compare_images, :remove_small_images])
      end
    end
  end

  describe "private methods" do
    let(:service) { described_class.new(source, entry) }

    describe "#english?" do
      it "returns true for English content" do
        allow(CLD).to receive(:detect_language).and_return({ code: "en" })
        expect(service.send(:english?)).to be true
      end

      it "returns false for non-English content" do
        allow(CLD).to receive(:detect_language).and_return({ code: "fr" })
        expect(service.send(:english?)).to be false
      end
    end

    describe "#allowed_media_type?" do
      context "with video category and video not allowed" do
        let(:video_entry) do
          double(
            "Entry",
            title: "Video",
            url: "https://example.com/video",
            summary: "Video",
            content: "Video",
            published: Time.current,
            categories: ["Video"],
            image: nil
          )
        end
        let(:no_video_source) { create(:source, allow_video: false) }

        before do
          stub_request(:get, video_entry.url).to_return(status: 200, body: html_response)
        end

        it "returns false" do
          service = described_class.new(no_video_source, video_entry)
          expect(service.send(:allowed_media_type?)).to be false
        end
      end

      context "with audio category and audio not allowed" do
        let(:audio_entry) do
          double(
            "Entry",
            title: "Podcast",
            url: "https://example.com/podcast",
            summary: "Podcast",
            content: "Podcast",
            published: Time.current,
            categories: ["Podcast"],
            image: nil
          )
        end
        let(:no_audio_source) { create(:source, allow_audio: false) }

        before do
          stub_request(:get, audio_entry.url).to_return(status: 200, body: html_response)
        end

        it "returns false" do
          service = described_class.new(no_audio_source, audio_entry)
          expect(service.send(:allowed_media_type?)).to be false
        end
      end

      context "with allowed media type" do
        it "returns true" do
          expect(service.send(:allowed_media_type?)).to be true
        end
      end
    end

    describe "#make_description" do
      context "with OG description" do
        it "uses OG description" do
          allow(Articles::TextCleaner).to receive(:clean_description).and_call_original
          service = described_class.new(source, entry)
          description = service.instance_variable_get(:@description)

          # OG description from html_response is "Test description from OG tags"
          expect(Articles::TextCleaner).to have_received(:clean_description).with("Test description from OG tags")
        end
      end

      context "without OG description but with entry summary" do
        let(:no_og_html) { "<html><body><p>Content</p></body></html>" }

        before do
          stub_request(:get, entry.url).to_return(status: 200, body: no_og_html)
        end

        it "uses entry summary" do
          allow(Articles::TextCleaner).to receive(:clean_description).and_call_original
          service = described_class.new(source, entry)

          expect(Articles::TextCleaner).to have_received(:clean_description).with(entry.summary)
        end
      end

      context "without OG description or summary" do
        let(:no_og_html) { "<html><body><p>Content</p></body></html>" }
        let(:entry_no_summary) do
          double(
            "Entry",
            title: "Test",
            url: "https://example.com/article",
            summary: nil,
            content: "Full content here",
            published: Time.current,
            categories: [],
            image: nil
          )
        end

        before do
          stub_request(:get, entry_no_summary.url).to_return(status: 200, body: no_og_html)
        end

        it "uses entry content" do
          allow(Articles::TextCleaner).to receive(:clean_description).and_call_original
          service = described_class.new(source, entry_no_summary)

          expect(Articles::TextCleaner).to have_received(:clean_description).with("Full content here")
        end
      end
    end

    describe "#determine_published_at" do
      it "returns current time if entry published is blank" do
        allow(entry).to receive(:published).and_return(nil)
        service = described_class.new(source, entry)

        published_at = service.send(:determine_published_at)
        expect(published_at).to be_within(1.second).of(Time.current)
      end

      it "returns entry published time if in the past" do
        past_time = 2.days.ago
        allow(entry).to receive(:published).and_return(past_time)
        service = described_class.new(source, entry)

        published_at = service.send(:determine_published_at)
        expect(published_at).to be_within(1.second).of(past_time)
      end

      it "returns current time if entry published is in the future" do
        future_time = 2.days.from_now
        allow(entry).to receive(:published).and_return(future_time)
        service = described_class.new(source, entry)

        published_at = service.send(:determine_published_at)
        expect(published_at).to be_within(1.second).of(Time.current)
      end
    end

    describe "#find_image_url" do
      context "when source shows images" do
        it "calls ImageFinder" do
          allow(Articles::ImageFinder).to receive_message_chain(:new, :find_url).and_return("https://example.com/image.jpg")
          service = described_class.new(source, entry)

          image_url = service.send(:find_image_url)
          expect(image_url).to eq("https://example.com/image.jpg")
        end
      end

      context "when source does not show images" do
        let(:no_image_source) { create(:source, show_images: false) }

        before do
          stub_request(:get, entry.url).to_return(status: 200, body: html_response)
        end

        it "returns nil" do
          service = described_class.new(no_image_source, entry)
          image_url = service.send(:find_image_url)

          expect(image_url).to be_nil
        end
      end
    end

    describe "#fetch_original_page" do
      context "with successful first attempt" do
        it "returns response with status 200" do
          service = described_class.new(source, entry)
          original_page = service.instance_variable_get(:@original_page)

          expect(original_page.status).to eq(200)
        end
      end

      context "when first attempt times out" do
        before do
          # First request times out, second succeeds
          stub_request(:get, entry.url)
            .to_raise(Faraday::TimeoutError).then
            .to_return(status: 200, body: html_response)
        end

        it "falls back to simplified request" do
          service = described_class.new(source, entry)
          original_page = service.instance_variable_get(:@original_page)

          expect(original_page.status).to eq(200)
        end
      end

      context "when Cloudflare challenge is detected on first attempt" do
        before do
          stub_request(:get, entry.url)
            .to_return(status: 403, body: "<html><title>Just a moment...</title></html>")

          allow(Articles::CloudflareDetector).to receive(:is_cloudflare_challenge?).and_return(true)
        end

        it "sets cloudflare_blocked to true" do
          service = described_class.new(source, entry)

          expect(service.cloudflare_blocked?).to be true
          expect(service.instance_variable_get(:@original_page)).to be false
        end
      end

      context "when Cloudflare challenge on fallback request" do
        before do
          # First attempt times out, second attempt gets Cloudflare
          stub_request(:get, entry.url)
            .to_timeout.then
            .to_return(status: 403, body: "<html><title>Just a moment...</title></html>")

          allow(Articles::CloudflareDetector).to receive(:is_cloudflare_challenge?).and_return(true)
        end

        it "sets cloudflare_blocked to true" do
          service = described_class.new(source, entry)

          expect(service.cloudflare_blocked?).to be true
          expect(service.instance_variable_get(:@original_page)).to be false
        end
      end
    end

    describe "#fetch_og_data" do
      it "parses OG data from HTML" do
        service = described_class.new(source, entry)
        og_data = service.send(:fetch_og_data)

        expect(og_data).to be_present
        expect(og_data.title).to eq("Test Article")
        expect(og_data.description).to eq("Test description from OG tags")
      end

      context "with malformed OG data" do
        let(:malformed_html) { "<html><body>No OG tags</body></html>" }

        before do
          stub_request(:get, entry.url).to_return(status: 200, body: malformed_html)
        end

        it "handles MalformedSourceError gracefully" do
          service = described_class.new(source, entry)

          expect {
            service.send(:fetch_og_data)
          }.not_to raise_error
        end
      end

      context "when original page is not fetched" do
        before do
          stub_request(:get, entry.url).to_return(status: 404)
        end

        it "returns nil" do
          service = described_class.new(source, entry)
          expect(service.send(:fetch_og_data)).to be_nil
        end
      end
    end

    describe "#article_readability_output" do
      before do
        allow(Articles::ReadabilityService).to receive_message_chain(:new, :parse).and_return({
          "title" => "Article Title",
          "content" => "<p>Content</p>"
        })
      end

      it "calls ReadabilityService" do
        service = described_class.new(source, entry)
        service.send(:article_readability_output, html_response)

        expect(Articles::ReadabilityService).to have_received(:new).with(html_response)
      end

      context "for chuangcn.org source" do
        let(:chuang_source) { create(:source, url: "https://chuangcn.org/feed.xml") }

        before do
          stub_request(:get, entry.url).to_return(status: 200, body: html_response)
          allow(Articles::ChuangHelper).to receive_message_chain(:new, :remove_chinese_section).and_return({
            "title" => "Without Chinese",
            "content" => "<p>English only</p>"
          })
        end

        it "removes Chinese section using ChuangHelper" do
          service = described_class.new(chuang_source, entry)
          service.send(:article_readability_output, html_response)

          expect(Articles::ChuangHelper).to have_received(:new)
        end
      end
    end
  end
end
