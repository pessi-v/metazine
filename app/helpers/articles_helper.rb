# frozen_string_literal: true

module ArticlesHelper
  def next_article_with_image(_articles)
    @articles = # TODO: remove " || article.description.length"
      @articles.sort_by do |article|
        article.description_length || article.description.length
      end.reverse
    index = @articles.index(&:image_url)
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

  def next_article_with_long_description(_articles)
    # TODO: remove " || article.description.length"
    @articles.sort_by! do |article|
      article.description_length || article.description.length
    end
    @articles.pop
  end

  def next_article_with_short_title(_articles)
    @articles.sort_by! { |article| article.title.length }
    @articles.delete_at(rand(5))
  end
end
