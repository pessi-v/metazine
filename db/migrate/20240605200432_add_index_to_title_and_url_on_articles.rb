# frozen_string_literal: true

class AddIndexToTitleAndUrlOnArticles < ActiveRecord::Migration[7.1]
  def change
    ActiveRecord::Base.connection.execute("
      delete from articles a using articles b where a.id < b.id and a.url = b.url and a.title = b.title;
    ")

    add_index :articles, %i[url title], unique: true
  end
end
