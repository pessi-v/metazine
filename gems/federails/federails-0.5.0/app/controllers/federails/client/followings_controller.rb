module Federails
  module Client
    class FollowingsController < Federails::ClientController
      before_action :authenticate_user!
      before_action :skip_authorization, only: [:new, :create]
      before_action :set_following, only: [:accept, :destroy]

      # GET /app/followings/new?uri={uri}
      def new
        # Find actor (and fetch if necessary)
        actor = Actor.find_or_create_by_federation_url(params[:uri])
        # Redirect to local profile page which will have a follow button on it
        redirect_to federails.client_actor_url(actor)
      end

      # PUT /app/followings/:id/accept
      # PUT /app/followings/:id/accept.json
      def accept
        respond_to do |format|
          url = federails.client_actor_url @following.actor
          if @following.accept!
            format.html { redirect_to url, notice: I18n.t('controller.followings.accept.success') }
            format.json { render :show, status: :ok, location: @following }
          else
            format.html { redirect_to url, alert: I18n.t('controller.followings.accept.error') }
            format.json { render json: @following.errors, status: :unprocessable_entity }
          end
        end
      end

      # POST /app/followings
      # POST /app/followings.json
      def create
        @following = Following.new(following_params)
        @following.actor = current_user.federails_actor
        authorize @following, policy_class: Federails::Client::FollowingPolicy

        save_and_render
      end

      # POST /app/followings/follow
      # POST /app/followings/follow.json
      def follow
        authorize Federails::Following, policy_class: Federails::Client::FollowingPolicy

        begin
          @following = Following.new_from_account following_account_params, actor: current_user.federails_actor
        rescue ::ActiveRecord::RecordNotFound
          # Renders a 422 instead of a 404
          respond_to do |format|
            format.html { redirect_to federails.client_actors_url, alert: I18n.t('controller.followings.follow.error') }
            format.json { render json: { target_actor: ['does not exist'] }, status: :unprocessable_entity }
          end

          return
        end

        save_and_render
      end

      # DELETE /app/followings/1
      # DELETE /app/followings/1.json
      def destroy
        @following.destroy
        respond_to do |format|
          format.html { redirect_to federails.client_actor_url(@following.actor), notice: I18n.t('controller.followings.destroy.success') }
          format.json { head :no_content }
        end
      end

      private

      # Use callbacks to share common setup or constraints between actions.
      def set_following
        @following = Following.find_param(params[:id])
        authorize @following, policy_class: Federails::Client::FollowingPolicy
      end

      # Only allow a list of trusted parameters through.
      def following_params
        params.require(:following).permit(:target_actor_id)
      end

      def following_account_params
        params.require(:account)
      end

      def save_and_render # rubocop:disable Metrics/AbcSize
        url = federails.client_actor_url current_user.federails_actor

        respond_to do |format|
          if @following.save
            format.html { redirect_to url, notice: I18n.t('controller.followings.save_and_render.success') }
            format.json { render :show, status: :created, location: @following }
          else
            format.html { redirect_to url, alert: I18n.t('controller.followings.save_and_render.error') }
            format.json { render json: @following.errors, status: :unprocessable_entity }
          end
        end
      end
    end
  end
end
