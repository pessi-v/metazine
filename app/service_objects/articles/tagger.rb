module Articles
  class Tagger
    def initialize(article)
      @article = article
    end

    def tag
      classifier = Informers.pipeline("zero-shot-classification", "Xenova/distilbert-base-uncased-mnli")
      classifier.call(@article.readability_output["content"], TAGS)
    end
  end
end
