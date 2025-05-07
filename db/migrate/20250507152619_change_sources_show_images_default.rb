class ChangeSourcesShowImagesDefault < ActiveRecord::Migration[8.0]
  def change
    change_column_default :sources, :show_images, from: nil, to: true
  end
end
