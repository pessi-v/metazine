# HTTP Signatures Implementation for ActivityPub

## Problem

When external users tried to follow the Instance Actor (or any actor), the request would fail with a 404 error because:

1. Many ActivityPub servers (like Kolektiva, Mastodon, etc.) **require HTTP signatures on all incoming requests**, including GET requests
2. Federails' `Federails::Utils::JsonRequest.get_json` makes unsigned GET requests
3. When federails tried to fetch remote actor data, those servers rejected the unsigned requests
4. This caused the follow processing to fail with `ActiveRecord::RecordNotFound`

## Solution

Implemented proper HTTP signatures for GET requests following the [ActivityPub HTTP Signature specification](https://swicg.github.io/activitypub-http-signature/) and [cavage-12 draft](https://datatracker.ietf.org/doc/html/draft-cavage-http-signatures-12).

### Implementation Components

#### 1. Signed Request Utility (`lib/fediverse/signed_request.rb`)

Created a new utility class that signs GET requests with HTTP signatures:

**Key features:**
- Signs requests using the instance actor's private key
- Follows cavage-12 specification for signature format
- Includes required headers: `(request-target)`, `host`, `date`
- Uses `rsa-sha256` algorithm (widely supported in the fediverse)
- Handles query parameters and redirects
- Falls back gracefully with proper error handling

**Signature format:**
```
Signature: keyId="actor_key_id",algorithm="rsa-sha256",headers="(request-target) host date",signature="base64_signature"
```

**Signature string format** (what gets signed):
```
(request-target): get /users/username
host: mastodon.social
date: Tue, 06 Jan 2026 23:05:12 GMT
```

#### 2. Webfinger Patch (`config/initializers/federails_webfinger_patch.rb`)

Patched federails' webfinger module to use signed GET requests:

- Uses `prepend` to override the private `get_json` method
- Attempts signed request first using the instance actor's credentials
- Falls back to unsigned requests if signing fails (for compatibility)
- Logs debug info for troubleshooting

#### 3. Follow Handler (`config/initializers/federails_follow_handler.rb`)

Simplified the follow handler since webfinger now handles signing:

- Removed complex custom logic
- Kept enhanced logging for debugging
- Now relies on the patched webfinger for all actor fetching
- Works for all actors (instance actor and regular users)

### Technical Details

**HTTP Signature Process:**

1. Build a GET request with required headers:
   - `Accept`: `application/activity+json`
   - `Host`: Target server hostname
   - `Date`: Current UTC time in HTTP date format

2. Create signature string (cavage-12 section 2.3):
   ```
   (request-target): <lowercase_method> <path_with_query>
   host: <hostname>
   date: <http_date>
   ```

3. Sign the string with RSA-SHA256 using instance actor's private key

4. Add `Signature` header with:
   - `keyId`: Instance actor's public key URL
   - `algorithm`: `rsa-sha256`
   - `headers`: List of signed headers
   - `signature`: Base64-encoded signature

### Testing

Verified the implementation works with:

```ruby
# Fetch a remote actor with HTTP signature
actor_data = Fediverse::SignedRequest.get_json(
  'https://mastodon.social/users/Gargron',
  from: instance_actor.federails_actor,
  headers: { accept: 'application/activity+json' }
)
# => Successfully returns actor data

# Process a follow request
Fediverse::Inbox.handle_create_follow_request(activity)
# => Creates and auto-accepts the follow
```

## Benefits

1. **Compatibility**: Works with servers that require HTTP signatures (Mastodon, Pleroma, etc.)
2. **Security**: Authenticates outgoing requests, preventing impersonation
3. **Spec Compliance**: Follows ActivityPub and cavage-12 standards
4. **Reliability**: Graceful fallback ensures compatibility with servers that don't require signatures
5. **Instance Actor Follows**: Instance actor follows now work correctly
6. **User Follows**: All follow requests benefit from signed actor fetching

## Files Modified

- `lib/fediverse/signed_request.rb` - New signed GET request utility
- `config/initializers/federails_webfinger_patch.rb` - Patch webfinger to use signed requests
- `config/initializers/federails_follow_handler.rb` - Simplified follow handler with logging

## Future Enhancements

Consider:
1. Contributing this back to federails gem
2. Adding configuration option to make signatures optional
3. Implementing signature verification for incoming GET requests
4. Adding metrics/monitoring for signature failures
