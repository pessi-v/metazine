class AddReadabilityOutputToArticles < ActiveRecord::Migration[7.1]
  def change
    add_column :articles, :readability_output, :text
  end
end
