class EnableUnaccentPgExtension < ActiveRecord::Migration[7.1]
  def change
    enable_extension 'unaccent'
  end
end
