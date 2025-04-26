# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Pagy::Backend

  def current_user
    binding.break
    @current_user ||= User.find_by(id: session[:user_id])
  end
end
