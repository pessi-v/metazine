class User < ApplicationRecord
  include Federails::ActorEntity

  acts_as_federails_actor(
    username_field: :username,
    name_field: :display_name,
    auto_create_actors: true
  )

  has_many :sessions, dependent: :destroy
  has_many :comments, dependent: :nullify

  validates :provider, :uid, presence: true
  validates :uid, uniqueness: {scope: :provider}

  # Create or update user from omniauth auth hash
  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_initialize.tap do |user|
      user.username = auth.info.nickname
      user.display_name = auth.info.name
      user.avatar_url = auth.info.image
      user.access_token = auth.credentials.token
      user.domain = extract_domain(auth)
      user.save!
    end
  end

  def name
    display_name || username || "User #{id}"
  end

  def full_username
    "@#{username}@#{domain}"
  end

  private

  def self.extract_domain(auth)
    # For Mastodon, the domain is in the auth hash
    auth.info.urls&.dig("Profile")&.match(/https?:\/\/([^\/]+)/)&.[](1) || auth.extra&.raw_info&.instance
  end
end
