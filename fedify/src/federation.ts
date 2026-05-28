import {
  Announce,
  Create,
  createFederation,
  Delete,
  Follow,
  Note,
  Page,
  Undo,
  Update,
} from "@fedify/fedify";
import { PostgresKvStore, PostgresMessageQueue } from "@fedify/postgres";
import { sql } from "./db.ts";
import { actorDispatcher, keyPairsDispatcher } from "./actors.ts";
import { followersDispatcher } from "./collections.ts";
import { articlePageDispatcher, commentNoteDispatcher } from "./objects.ts";
import {
  onFollow,
  onUndoFollow,
  onCreateObject,
  onUpdateNote,
  onDeleteNote,
  onAnnounce,
} from "./inbox.ts";

export const federation = createFederation<void>({
  kv: new PostgresKvStore(sql),
  queue: new PostgresMessageQueue(sql),
});

federation
  .setActorDispatcher("/ap/actors/{identifier}", actorDispatcher)
  .setKeyPairsDispatcher(keyPairsDispatcher);

federation.setFollowersDispatcher(
  "/ap/actors/{identifier}/followers",
  followersDispatcher,
);

federation
  .setInboxListeners("/ap/actors/{identifier}/inbox", "/ap/inbox")
  .on(Follow, onFollow)
  .on(Undo, onUndoFollow)
  .on(Create, onCreateObject)
  .on(Update, onUpdateNote)
  .on(Delete, onDeleteNote)
  .on(Announce, onAnnounce);

// Articles are served as Page (Lemmy-compatible); comments as Note (Mastodon-compatible)
federation.setObjectDispatcher(Page, "/ap/articles/{id}", articlePageDispatcher);
federation.setObjectDispatcher(Note, "/ap/comments/{id}", commentNoteDispatcher);

federation.setNodeInfoDispatcher("/nodeinfo/2.1", () => ({
  software: {
    name: "metazine",
    version: { major: 0, minor: 1, patch: 0 },
    homepage: new URL(`https://${process.env.APP_HOST ?? "localhost"}`),
  },
  protocols: ["activitypub"],
  openRegistrations: false,
  usage: { users: { total: 1, activeHalfyear: 1, activeMonth: 1 }, localPosts: 0, localComments: 0 },
}));
