# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Pagy::Backend

  helper_method :current_user

  def current_user
    User.last
  end

  def pundit_user
    User.last
  end
end
