import { Temporal } from "@js-temporal/polyfill";
import { type Context, Image, Note, Page, PUBLIC_COLLECTION } from "@fedify/fedify";
import { sql, type ArticleRow, type CommentRow } from "./db.ts";

const APP_HOST = process.env.APP_HOST ?? "";

async function parentFederatedUrl(
  parentType: string,
  parentId: number,
): Promise<string | null> {
  if (parentType === "Article") {
    const [row] = await sql<[{ federated_url: string | null }]>`
      SELECT federated_url FROM articles WHERE id = ${parentId} LIMIT 1
    `;
    return row?.federated_url ?? null;
  }
  if (parentType === "Comment") {
    const [row] = await sql<[{ federated_url: string | null }]>`
      SELECT federated_url FROM comments WHERE id = ${parentId} LIMIT 1
    `;
    return row?.federated_url ?? null;
  }
  return null;
}

// Fallback content for articles federated before Rails started storing
// federated_content. Kept in sync with app/views/articles/_federated_content.html.slim.
function fallbackArticleContent(article: ArticleRow): string {
  const metazineUrl = `https://${APP_HOST}/reader/${article.id}`;
  const sourceName = article.source_name
    ? article.url
      ? `<p><a href="${article.url}">${article.source_name}</a></p>`
      : `<p>${article.source_name}</p>`
    : "";
  return [
    article.image_url
      ? `<p><a href="${metazineUrl}"><img src="${article.image_url}" alt="${article.title ?? ""}"></a></p>`
      : "",
    sourceName,
    article.title
      ? `<p><a href="${metazineUrl}"><strong>${article.title}</strong></a></p>`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

// Articles are served as Page so Lemmy can add them to community feeds.
// Mastodon also understands Page (treats it like a Note).
export async function buildArticlePage(
  ctx: Context<void>,
  articleId: number,
): Promise<Page | null> {
  const [article] = await sql<ArticleRow[]>`
    SELECT id, title, description, url, source_name, image_url, published_at, federated_url, federated_content
    FROM articles
    WHERE id = ${articleId}
    LIMIT 1
  `;
  if (!article) return null;

  const pageId = article.federated_url
    ? new URL(article.federated_url)
    : ctx.getObjectUri(Page, { id: String(articleId) });

  // Prefer the HTML rendered and stored by Rails; fall back to the inline builder
  // for articles federated before federated_content existed.
  const content = article.federated_content ?? fallbackArticleContent(article);

  const attachments: Image[] = article.image_url
    ? [new Image({ mediaType: "image/jpeg", url: new URL(article.image_url) })]
    : [];

  const published = article.published_at
    ? Temporal.Instant.fromEpochMilliseconds(article.published_at.getTime())
    : undefined;

  return new Page({
    id: pageId,
    name: article.title ?? undefined,
    attribution: ctx.getActorUri("instance"),
    to: PUBLIC_COLLECTION,
    cc: ctx.getFollowersUri("instance"),
    content,
    published,
    sensitive: false,
    url: new URL(`https://${APP_HOST}/reader/${article.id}`),
    attachments,
  });
}

export async function buildCommentNote(
  ctx: Context<void>,
  commentId: number,
): Promise<Note | null> {
  const [comment] = await sql<CommentRow[]>`
    SELECT id, content, federated_url, deleted_at, parent_type, parent_id, created_at
    FROM comments
    WHERE id = ${commentId}
    LIMIT 1
  `;
  if (!comment || comment.deleted_at) return null;

  const noteId = comment.federated_url
    ? new URL(comment.federated_url)
    : ctx.getObjectUri(Note, { id: String(commentId) });

  const replyUrl = await parentFederatedUrl(comment.parent_type, comment.parent_id);
  const published = Temporal.Instant.fromEpochMilliseconds(
    comment.created_at.getTime(),
  );

  return new Note({
    id: noteId,
    attribution: ctx.getActorUri("instance"),
    to: PUBLIC_COLLECTION,
    cc: ctx.getFollowersUri("instance"),
    content: `<p>${comment.content}</p>`,
    published,
    sensitive: false,
    replyTarget: replyUrl ? new URL(replyUrl) : undefined,
    url: noteId,
  });
}

// Object dispatcher for GET /ap/articles/{id}
export async function articlePageDispatcher(
  ctx: Context<void>,
  values: { id: string },
): Promise<Page | null> {
  return buildArticlePage(ctx, parseInt(values.id, 10));
}

// Object dispatcher for GET /ap/comments/{id}
export async function commentNoteDispatcher(
  ctx: Context<void>,
  values: { id: string },
): Promise<Note | null> {
  return buildCommentNote(ctx, parseInt(values.id, 10));
}
