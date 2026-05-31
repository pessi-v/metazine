import {
  Announce,
  Create,
  Delete,
  Follow,
  type Federation,
  isActor,
  Note,
  Page,
  PUBLIC_COLLECTION,
  Tombstone,
} from "@fedify/fedify";
import { federation } from "./federation.ts";
import { buildArticlePage } from "./objects.ts";

const APP_HOST = process.env.APP_HOST ?? "";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET ?? "";

function unauthorized(): Response {
  return new Response("Unauthorized", { status: 401 });
}

function authorized(req: Request): boolean {
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  return INTERNAL_SECRET.length > 0 && token === INTERNAL_SECRET;
}

function baseUrl(): URL {
  return new URL(`https://${APP_HOST}`);
}

function randomId(path: string): URL {
  return new URL(`https://${APP_HOST}/ap/${path}/${crypto.randomUUID()}`);
}

async function handleSendActivity(req: Request): Promise<Response> {
  const body = await req.json().catch(() => null);
  if (!body) return new Response("Bad Request", { status: 400 });

  const ctx = federation.createContext(baseUrl(), undefined);
  const { type } = body as { type: string };

  switch (type) {
    case "CreateArticle": {
      const { objectId } = body as { objectId: number };
      const page = await buildArticlePage(ctx, objectId);
      if (!page) return new Response("Article not found", { status: 404 });

      await ctx.sendActivity(
        { identifier: "instance" },
        "followers",
        new Create({
          id: randomId("creates"),
          actor: ctx.getActorUri("instance"),
          to: PUBLIC_COLLECTION,
          cc: ctx.getFollowersUri("instance"),
          object: page,
        }),
      );
      break;
    }

    case "DeleteComment": {
      const { objectId } = body as { objectId: number };
      const commentUri = ctx.getObjectUri(Note, { id: String(objectId) });

      await ctx.sendActivity(
        { identifier: "instance" },
        "followers",
        new Delete({
          id: randomId("deletes"),
          actor: ctx.getActorUri("instance"),
          to: PUBLIC_COLLECTION,
          object: new Tombstone({ id: commentUri }),
        }),
      );
      break;
    }

    case "AnnounceComment": {
      const { objectUrl } = body as { objectUrl: string };
      if (!objectUrl) return new Response("objectUrl required", { status: 400 });

      await ctx.sendActivity(
        { identifier: "instance" },
        "followers",
        new Announce({
          id: randomId("announces"),
          actor: ctx.getActorUri("instance"),
          to: PUBLIC_COLLECTION,
          cc: ctx.getFollowersUri("instance"),
          object: new URL(objectUrl),
        }),
      );
      break;
    }

    // Makes the InstanceActor follow a Lemmy community (or any AP Group actor).
    // Rails calls this so admins can subscribe to external communities.
    case "FollowCommunity": {
      const { communityUrl } = body as { communityUrl: string };
      if (!communityUrl) return new Response("communityUrl required", { status: 400 });

      const community = await ctx.lookupObject(communityUrl);
      if (!community || !isActor(community)) {
        return new Response("Not a valid ActivityPub actor", { status: 422 });
      }

      await ctx.sendActivity(
        { identifier: "instance" },
        community,
        new Follow({
          id: randomId("follows"),
          actor: ctx.getActorUri("instance"),
          object: new URL(communityUrl),
        }),
      );
      break;
    }

    default:
      return new Response(`Unknown type: ${type}`, { status: 400 });
  }

  return new Response(JSON.stringify({ queued: true }), {
    status: 202,
    headers: { "content-type": "application/json" },
  });
}

export async function handleInternal(
  req: Request,
  _federation: Federation<void>,
): Promise<Response | null> {
  const url = new URL(req.url);

  if (req.method === "GET" && url.pathname === "/internal/health") {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  }

  if (req.method === "POST" && url.pathname === "/internal/send-activity") {
    if (!authorized(req)) return unauthorized();
    return handleSendActivity(req);
  }

  return null;
}
