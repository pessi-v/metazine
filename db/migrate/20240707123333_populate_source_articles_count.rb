class PopulateSourceArticlesCount < ActiveRecord::Migration[7.1]
  def up
    Source.find_each do |source|
      Source.reset_counters(source.id, :articles)
    end
  end
end
