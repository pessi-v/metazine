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

  def extract_shortest_description_article
    return nil if @articles.empty?

    # Find the index of the article with the shortest description
    shortest_index = @articles.each_with_index.min_by { |article, _| article.description.to_s.length }[1]

    # Remove and return the article
    @articles.delete_at(shortest_index)
  end

  # def next_article_with_short_title(_articles)
  #   shortest_five_titles = @articles.sort_by! { |article| article.title.length }[..5]
  #   @articles.delete_at(rand(5))
  # end

  def three_short_titles
    # shortest_five_titles = @articles.sort_by! { |article| article.title.length }[..5]
    # three_short_titles = shortest_five_titles.sample(3)
    # @articles -= three_short_titles
    # three_short_titles

    three_short_titles = @articles.sort_by! { |article| article.title.length }[..2]
    # three_short_titles = shortest_five_titles.sample(3)
    @articles -= three_short_titles
    three_short_titles.shuffle

  end
end
