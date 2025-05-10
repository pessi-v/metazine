module ArticlesHelper
  def next_article_with_image(_articles)
    @articles =
      @articles.sort_by do |article|
        article.description_length
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
    @articles.sort_by! do |article|
      article.description_length
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

  def three_short_titles
    three_short_titles = @articles.sort_by! { |article| article.title.length }[..2]
    @articles -= three_short_titles
    three_short_titles.shuffle
  end
end
