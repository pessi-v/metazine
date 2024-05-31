require "test_helper"

class SourcesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @source = sources(:one)
  end

  test "should get index" do
    get sources_url
    assert_response :success
  end

  test "should get new" do
    get new_source_url
    assert_response :success
  end

  test "should create source" do
    assert_difference("Source.count") do
      post sources_url, params: { source: { active: @source.active, etag: @source.etag, last_error_status: @source.last_error_status, last_modified: @source.last_modified, name: @source.name, show_images: @source.show_images, url: @source.url } }
    end

    assert_redirected_to source_url(Source.last)
  end

  test "should show source" do
    get source_url(@source)
    assert_response :success
  end

  test "should get edit" do
    get edit_source_url(@source)
    assert_response :success
  end

  test "should update source" do
    patch source_url(@source), params: { source: { active: @source.active, etag: @source.etag, last_error_status: @source.last_error_status, last_modified: @source.last_modified, name: @source.name, show_images: @source.show_images, url: @source.url } }
    assert_redirected_to source_url(@source)
  end

  test "should destroy source" do
    assert_difference("Source.count", -1) do
      delete source_url(@source)
    end

    assert_redirected_to sources_url
  end
end
