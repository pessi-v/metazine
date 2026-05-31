const RAILS_INTERNAL_URL =
  process.env.RAILS_INTERNAL_URL ?? "http://localhost:3000";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET ?? "";
const APP_HOST = process.env.APP_HOST ?? "";

export type InboxPayload = {
  type: string;
  actorUrl: string;
  object?: unknown;
  raw: unknown;
};

export async function notifyRails(payload: InboxPayload): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  let res: Response;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${INTERNAL_SECRET}`,
    };
    if (APP_HOST) headers["Host"] = APP_HOST;

    res = await fetch(`${RAILS_INTERNAL_URL}/internal/ap/activity`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (e) {
    throw new Error(
      `Rails webhook fetch failed (${RAILS_INTERNAL_URL}): ${e}`,
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Rails webhook returned ${res.status} for ${RAILS_INTERNAL_URL}/internal/ap/activity: ${body.slice(0, 500)}`,
    );
  }
}
