import type { Context } from "@fedify/fedify";
import { sql, type ApFollowRow } from "./db.ts";

const PAGE_SIZE = 50;

export async function followersDispatcher(
  _ctx: Context<void>,
  identifier: string,
  cursor: string | null,
) {
  if (identifier !== "instance") return null;

  const offset = cursor ? parseInt(cursor, 10) : 0;

  const [countRow] = await sql<[{ count: string }]>`
    SELECT COUNT(*)::text AS count FROM ap_follows WHERE status = 1
  `;
  const totalItems = parseInt(countRow.count, 10);

  const rows = await sql<Pick<ApFollowRow, "follower_url" | "follower_inbox_url">[]>`
    SELECT follower_url, follower_inbox_url
    FROM ap_follows
    WHERE status = 1
    ORDER BY id
    LIMIT ${PAGE_SIZE} OFFSET ${offset}
  `;

  return {
    items: rows.map((r) => ({
      id: new URL(r.follower_url),
      inboxId: new URL(r.follower_inbox_url),
    })),
    nextCursor:
      offset + PAGE_SIZE < totalItems ? String(offset + PAGE_SIZE) : null,
    totalItems,
  };
}
