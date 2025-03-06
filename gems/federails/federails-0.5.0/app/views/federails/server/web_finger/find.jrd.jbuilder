json.subject params[:resource]

links = [
  # Federation actor URL
  {
    rel:  'self',
    type: Mime[:activitypub].to_s,
    href: @user.federails_actor.federated_url,
  },
]

# User profile URL if configured
# TODO: Add a profile controller/action in dummy to test this
if @user.federails_actor.profile_url
  links.push rel:  'https://webfinger.net/rel/profile-page',
             type: 'text/html',
             href: @user.federails_actor.profile_url
end

# Remote following
links.push rel:      'http://ostatus.org/schema/1.0/subscribe',
           template: "#{remote_follow_url}?uri={uri}"

json.links links
