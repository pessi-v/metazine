require "test_helper"

module Articles
  class CreateServiceTest < ActiveSupport::TestCase
    setup do
      # Create a mock source
      @source = mock("Source")
      @source.stubs(:name).returns("Test Source")
      @source.stubs(:url).returns("https://example.com/feed.xml")
      @source.stubs(:id).returns(1)
      @source.stubs(:allow_video).returns(true)
      @source.stubs(:allow_audio).returns(true)
      @source.stubs(:show_images).returns(true)

      # Create a mock instance actor
      @instance_actor = mock("InstanceActor")
      Federails::Actor.stubs(:where).with(entity_type: "InstanceActor").returns([@instance_actor])

      @entry = mock("Entry")
      @entry.stubs(:title).returns("Sample Article Title")
      @entry.stubs(:url).returns("https://example.com/article")
      @entry.stubs(:summary).returns("This is a sample article summary for testing purposes.")
      @entry.stubs(:content).returns("This is the full content of the article.")
      @entry.stubs(:published).returns(Time.current - 1.day)
      @entry.stubs(:categories).returns([])
      @entry.stubs(:image).returns(nil)

      # Mock the HTTP response
      @response = mock("Response")
      @response.stubs(:status).returns(200)
      @response.stubs(:body).returns("<html><body>Article content</body></html>")

      # Set up the service with mocked dependencies
      @service = CreateService.new(@source, @entry)

      # Replace the actual HTTP call with our mocked response
      @service.instance_variable_set(:@original_page, @response)

      # Mock language detection to return English
      CLD.stubs(:detect_language).returns({code: "en"})

      # Mock article_attributes method to avoid creating real associations
      @service.stubs(:article_attributes).returns({
        title: "Sample Article Title",
        description: "This is a sample article summary",
        url: "https://example.com/article",
        source_name: "Test Source",
        source_id: 1,
        published_at: Time.current - 1.day
      })
    end

    test "creates article successfully" do
      # Mock dependencies
      @service.stubs(:article_exists?).returns(false)
      @service.stubs(:english?).returns(true)
      @service.stubs(:allowed_media_type?).returns(true)

      # Create a mock article
      article = mock("Article")
      article.stubs(:save).returns(true)

      # Mock the Article.new call
      Article.stubs(:new).returns(article)

      # Mock the approval helper
      approval_helper = mock("ApprovalHelper")
      approval_helper.stubs(:approve?).returns(true)
      ApprovalHelper.stubs(:new).with(article).returns(approval_helper)

      # Mock ImageHelper
      ImageHelper.stubs(:compare_and_update_article_images).with(article).returns(article)

      # Run the method
      result = @service.create_article

      # Verify the result
      assert_equal article, result
    end

    test "doesn't create article when it already exists" do
      @service.stubs(:article_exists?).returns(true)
      result = @service.create_article
      assert_nil result
    end

    test "doesn't create article when content is not in English" do
      @service.stubs(:article_exists?).returns(false)
      @service.stubs(:english?).returns(false)
      result = @service.create_article
      assert_nil result
    end

    test "doesn't create article when media type is not allowed" do
      @service.stubs(:article_exists?).returns(false)
      @service.stubs(:english?).returns(true)
      @service.stubs(:allowed_media_type?).returns(false)
      result = @service.create_article
      assert_nil result
    end

    test "doesn't create article when it's not approved" do
      @service.stubs(:article_exists?).returns(false)
      @service.stubs(:english?).returns(true)
      @service.stubs(:allowed_media_type?).returns(true)

      # Create a mock article
      article = mock("Article")

      # Mock the Article.new call
      Article.stubs(:new).returns(article)

      # Mock the approval helper to return false
      approval_helper = mock("ApprovalHelper")
      approval_helper.stubs(:approve?).returns(false)
      ApprovalHelper.stubs(:new).with(article).returns(approval_helper)

      result = @service.create_article
      assert_nil result
    end

    test "handles cloudflare challenge" do
      # Create a more complete mock entry
      entry = mock("Entry")
      entry.stubs(:url).returns("https://example.com/cloudflare-protected")
      entry.stubs(:title).returns("Protected Title")
      entry.stubs(:summary).returns("Test summary")
      entry.stubs(:content).returns("Test content")
      entry.stubs(:published).returns(Time.current)
      entry.stubs(:categories).returns([])
      entry.stubs(:image).returns(nil)

      # Override the actual CreateService class with a test subclass
      test_service_class = Class.new(CreateService) do
        # Override initialize to set @original_page to false
        def initialize(source, entry)
          @source = source
          @entry = entry
          @original_page = false
          # Don't call super
        end
      end

      # Create an instance of our test subclass
      service = test_service_class.new(@source, entry)

      # Run the method
      result = service.create_article

      # It should return nil
      assert_nil result
    end

    test "checks article existence correctly" do
      # Test when article with same title exists
      Article.stubs(:where).returns(Article)
      Article.stubs(:exists?).returns(true)

      assert @service.send(:article_exists?)

      # Test when article doesn't exist
      Article.stubs(:where).returns(Article)
      Article.stubs(:exists?).returns(false)

      refute @service.send(:article_exists?)
    end

    test "determines if content is in English" do
      # Already mocked in setup to return English
      assert @service.send(:english?)

      # Change the mock to return a different language
      CLD.stubs(:detect_language).returns({code: "fr"})

      refute @service.send(:english?)
    end

    test "determines allowed media types correctly" do
      # Test video content when source allows videos
      @entry.stubs(:categories).returns(["Video"])
      @source.stubs(:allow_video).returns(true)

      assert @service.send(:allowed_media_type?)

      # Test video content when source doesn't allow videos
      @source.stubs(:allow_video).returns(false)

      refute @service.send(:allowed_media_type?)

      # Test audio content when source allows audio
      @entry.stubs(:categories).returns(["Podcast"])
      @source.stubs(:allow_audio).returns(true)

      assert @service.send(:allowed_media_type?)

      # Test audio content when source doesn't allow audio
      @source.stubs(:allow_audio).returns(false)

      refute @service.send(:allowed_media_type?)

      # Test regular content (no special media types)
      @entry.stubs(:categories).returns(["News"])

      assert @service.send(:allowed_media_type?)
    end

    test "handles future publish dates correctly" do
      future_time = Time.current + 1.day
      @entry.stubs(:published).returns(future_time)

      # Should return current time instead of future time
      result = @service.send(:determine_published_at)

      assert result <= Time.current
      assert_not_equal future_time, result
    end

    test "uses OG description when available" do
      og_data = mock
      og_data.stubs(:description).returns("This is the OG description")

      @service.stubs(:fetch_og_data).returns(og_data)

      # Replace any_instance with direct class method stub
      TextCleaner.stubs(:clean_description).returns("This is the OG description")

      result = @service.send(:make_description)
      assert_equal "This is the OG description", result
    end

    test "falls back to entry summary when OG description is not available" do
      @service.stubs(:fetch_og_data).returns(nil)

      # Replace any_instance with direct class method stub
      TextCleaner.stubs(:clean_description).returns("This is a sample article summary for testing purposes.")

      result = @service.send(:make_description)
      assert_equal "This is a sample article summary for testing purposes.", result
    end

    test "detects paywalled content correctly" do
      # Test with paywall form
      html_with_paywall = '<html><body><div id="paywall-form">Subscribe to continue</div></body></html>'
      @response.stubs(:body).returns(html_with_paywall)

      assert @service.send(:paywalled?)

      # Test with paywall message
      html_with_message = '<html><body><div class="po-ln__message">This content is available to subscribers only</div></body></html>'
      @response.stubs(:body).returns(html_with_message)

      assert @service.send(:paywalled?)

      # Test with truncated content
      html_with_truncated = '<html><body><div class="po-cn__intro">This is the intro that ends with […]</div></body></html>'
      @response.stubs(:body).returns(html_with_truncated)

      assert @service.send(:paywalled?)

      # Test with normal content
      html_normal = "<html><body><div>This is normal content without paywall indicators</div></body></html>"
      @response.stubs(:body).returns(html_normal)

      refute @service.send(:paywalled?)
    end
  end
end
