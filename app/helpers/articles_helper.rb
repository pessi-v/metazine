module ArticlesHelper
  def next_article_with_image(articles)
    @articles = @articles.sort_by { |article| article.description_length || article.description.length }.reverse # TODO remove " || article.description.length"
    index = @articles.index { |article| article.image_url }
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

  def next_article_with_long_description(articles)
    @articles.sort_by! { |article| article.description_length || article.description.length } # TODO remove " || article.description.length"
    @articles.pop
  end

  def next_article_with_short_title(articles)
    @articles.sort_by! { |article| article.title.length }
    @articles.delete_at(rand(5))
  end
end
