module ArticlesHelper
  def next_article_with_image(articles)
    index = articles.index { |article| article.image_url }
    @articles.delete_at(index)
  end

  def next_article_without_image(articles)
    index = articles.index { |article| !article.image_url }
    if index
      @articles.delete_at(index)
    else
      next_article_with_image(articles)
    end
  end
end
