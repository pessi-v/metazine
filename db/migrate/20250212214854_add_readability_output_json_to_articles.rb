class AddReadabilityOutputJsonToArticles < ActiveRecord::Migration[8.0]
  def change
    add_column :articles, :readability_output_jsonb, :jsonb, null: false, default: '{}'
  end
end
