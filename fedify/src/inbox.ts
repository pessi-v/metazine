import {
  Accept,
  Announce,
  Create,
  Delete,
  Follow,
  type InboxContext,
  Undo,
  Update,
  type Activity,
} from "@fedify/fedify";
import { sql } from "./db.ts";
import { notifyRails } from "./rails-webhook.ts";

const APP_HOST = process.env.APP_HOST ?? "";

async function actorHref(ctx: InboxContext<void>, activity: Activity): Promise<string> {
  return (await activity.getActor(ctx))?.id?.href ?? "";
}

export async function onFollow(
  ctx: InboxContext<void>,
  follow: Follow,
): Promise<void> {
  const remoteActor = await follow.getActor(ctx);
  const followerUrl = remoteActor?.id?.href;
  if (!followerUrl) return;

  const inboxUrl =
    remoteActor.endpoints?.sharedInbox?.href ??
    remoteActor.inboxId?.href;
  if (!inboxUrl) return;

  await sql`
    INSERT INTO ap_follows (follower_url, follower_inbox_url, status, follow_activity_url, created_at, updated_at)
    VALUES (${followerUrl}, ${inboxUrl}, 1, ${follow.id?.href ?? null}, NOW(), NOW())
    ON CONFLICT (follower_url) DO UPDATE
      SET follower_inbox_url = EXCLUDED.follower_inbox_url,
          follow_activity_url = EXCLUDED.follow_activity_url,
          status = 1,
          updated_at = NOW()
  `;

  await ctx.sendActivity(
    { identifier: "instance" },
    remoteActor,
    new Accept({
      id: new URL(`https://${APP_HOST}/ap/accepts/${crypto.randomUUID()}`),
      actor: ctx.getActorUri("instance"),
      object: follow,
    }),
  );
}

export async function onUndoFollow(
  ctx: InboxContext<void>,
  undo: Undo,
): Promise<void> {
  const followerUrl = (await undo.getActor(ctx))?.id?.href;
  if (!followerUrl) return;

  await sql`DELETE FROM ap_follows WHERE follower_url = ${followerUrl}`;
}

// Handles Create activities for both Note (Mastodon comments) and Page (Lemmy posts)
export async function onCreateObject(
  ctx: InboxContext<void>,
  create: Create,
): Promise<void> {
  console.log(`[inbox] Create from ${create.actorId?.href}`);
  const object = await create.getObject(ctx);
  console.log(`[inbox] Create object type: ${object?.constructor?.name}, id: ${object?.id?.href}`);
  await notifyRails({
    type: "Create",
    actorUrl: await actorHref(ctx, create),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    object: object ? await (object as any).toJsonLd() : null,
    raw: await create.toJsonLd(),
  });
  console.log("[inbox] Create forwarded to Rails");
}

export async function onUpdateNote(
  ctx: InboxContext<void>,
  update: Update,
): Promise<void> {
  const object = await update.getObject(ctx);
  await notifyRails({
    type: "Update",
    actorUrl: await actorHref(ctx, update),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    object: object ? await (object as any).toJsonLd() : null,
    raw: await update.toJsonLd(),
  });
}

export async function onDeleteNote(
  ctx: InboxContext<void>,
  delete_: Delete,
): Promise<void> {
  const objectId =
    delete_.objectId?.href ??
    (await delete_.getObject(ctx))?.id?.href;

  await notifyRails({
    type: "Delete",
    actorUrl: await actorHref(ctx, delete_),
    object: { id: objectId },
    raw: await delete_.toJsonLd(),
  });
}

export async function onAnnounce(
  ctx: InboxContext<void>,
  announce: Announce,
): Promise<void> {
  await notifyRails({
    type: "Announce",
    actorUrl: await actorHref(ctx, announce),
    object: announce.objectId?.href ?? null,
    raw: await announce.toJsonLd(),
  });
}
