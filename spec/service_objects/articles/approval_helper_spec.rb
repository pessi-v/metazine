require "rails_helper"

RSpec.describe Articles::ApprovalHelper do
  let(:source) { create(:source) }
  let!(:instance_actor) { create(:federails_actor, entity_type: "InstanceActor") }

  describe "#approve?" do
    context "when readability_output_jsonb is blank" do
      let(:article) { build(:article, source: source, readability_output_jsonb: nil) }

      it "returns false" do
        helper = described_class.new(article)
        expect(helper.approve?).to be false
      end
    end

    context "when readability_output_jsonb is an empty hash" do
      let(:article) { build(:article, source: source, readability_output_jsonb: {}) }

      it "returns false" do
        helper = described_class.new(article)
        expect(helper.approve?).to be false
      end
    end

    context "when content field is blank" do
      let(:article) do
        create(:article, source: source, readability_output_jsonb: {
          "title" => "Test Article",
          "content" => nil
        })
      end

      it "returns false" do
        helper = described_class.new(article)
        expect(helper.approve?).to be false
      end
    end

    context "when content field is empty string" do
      let(:article) do
        create(:article, source: source, readability_output_jsonb: {
          "title" => "Test Article",
          "content" => ""
        })
      end

      it "returns false" do
        helper = described_class.new(article)
        expect(helper.approve?).to be false
      end
    end

    context "when content length is less than 1900" do
      let(:short_content) { "<p>#{'word ' * 100}</p>" } # Short content

      let(:article) do
        create(:article, source: source, readability_output_jsonb: {
          "title" => "Test Article",
          "content" => short_content,
          "length" => 500
        })
      end

      it "returns false" do
        helper = described_class.new(article)
        expect(helper.approve?).to be false
      end
    end

    context "when content contains forbidden strings" do
      let(:article) do
        create(:article, source: source, readability_output_jsonb: {
          "title" => "Test Article",
          "content" => "<p>Of the principles and themes outlined in this issue, Tribune readers will easily discern. \u2018Gastropolitics\u2019 discusses how food matters to socialist politics. Food institutions historic, existing or imagined, are discussed, as well as the transformative urges behind their establishment.</p>",
          "length" => 2000
        })
      end

      it "returns false" do
        helper = described_class.new(article)
        expect(helper.approve?).to be false
      end
    end

    context "when content is valid and passes all checks" do
      let(:long_content) { "<p>#{'This is a long article with lots of content. ' * 100}</p>" }

      let(:article) do
        create(:article, source: source, readability_output_jsonb: {
          "title" => "Test Article",
          "content" => long_content,
          "length" => 5000
        })
      end

      it "returns true" do
        helper = described_class.new(article)
        expect(helper.approve?).to be true
      end
    end

    context "when length field is missing but content is long enough" do
      let(:long_content) { "<p>#{'This is a long article with lots of content. ' * 100}</p>" }

      let(:article) do
        create(:article, source: source, readability_output_jsonb: {
          "title" => "Test Article",
          "content" => long_content
        })
      end

      it "returns true when no length check is applied" do
        helper = described_class.new(article)
        expect(helper.approve?).to be true
      end
    end

    context "edge case: content length exactly 1899" do
      let(:article) do
        create(:article, source: source, readability_output_jsonb: {
          "title" => "Test Article",
          "content" => "<p>Some content</p>",
          "length" => 1899
        })
      end

      it "returns false" do
        helper = described_class.new(article)
        expect(helper.approve?).to be false
      end
    end

    context "edge case: content length exactly 1900" do
      let(:article) do
        create(:article, source: source, readability_output_jsonb: {
          "title" => "Test Article",
          "content" => "<p>Some content</p>",
          "length" => 1900
        })
      end

      it "returns true" do
        helper = described_class.new(article)
        expect(helper.approve?).to be true
      end
    end

    context "when content does not contain forbidden strings" do
      let(:article) do
        create(:article, source: source, readability_output_jsonb: {
          "title" => "Test Article",
          "content" => "<p>This is perfectly normal article content about technology and news.</p>",
          "length" => 2000
        })
      end

      it "returns true" do
        helper = described_class.new(article)
        expect(helper.approve?).to be true
      end
    end

    context "when article is paywalled" do
      let(:long_content) { "<p>#{'This is a long article with lots of content. ' * 100}</p>" }

      context "with paywall form div" do
        let(:paywalled_html) do
          <<~HTML
            <html>
              <body>
                <div id="paywall-form">Subscribe to continue</div>
              </body>
            </html>
          HTML
        end

        let(:article) do
          create(:article, source: source, readability_output_jsonb: {
            "title" => "Test Article",
            "content" => long_content,
            "length" => 5000
          })
        end

        it "returns false" do
          helper = described_class.new(article, original_page_body: paywalled_html)
          expect(helper.approve?).to be false
        end
      end

      context "with paywall message" do
        let(:paywalled_html) do
          <<~HTML
            <html>
              <body>
                <div class="po-ln__message">This content is available to subscribers only</div>
              </body>
            </html>
          HTML
        end

        let(:article) do
          create(:article, source: source, readability_output_jsonb: {
            "title" => "Test Article",
            "content" => long_content,
            "length" => 5000
          })
        end

        it "returns false" do
          helper = described_class.new(article, original_page_body: paywalled_html)
          expect(helper.approve?).to be false
        end
      end

      context "with ellipsis truncation" do
        let(:paywalled_html) do
          <<~HTML
            <html>
              <body>
                <div class="po-cn__intro">This is truncated content […]</div>
              </body>
            </html>
          HTML
        end

        let(:article) do
          create(:article, source: source, readability_output_jsonb: {
            "title" => "Test Article",
            "content" => long_content,
            "length" => 5000
          })
        end

        it "returns false" do
          helper = described_class.new(article, original_page_body: paywalled_html)
          expect(helper.approve?).to be false
        end
      end
    end

    context "when no original_page_body is provided" do
      let(:long_content) { "<p>#{'This is a long article with lots of content. ' * 100}</p>" }

      let(:article) do
        create(:article, source: source, readability_output_jsonb: {
          "title" => "Test Article",
          "content" => long_content,
          "length" => 5000
        })
      end

      it "returns true (skips paywall check)" do
        helper = described_class.new(article, original_page_body: nil)
        expect(helper.approve?).to be true
      end
    end
  end
end
