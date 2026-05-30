const RAILS_INTERNAL_URL =
  process.env.RAILS_INTERNAL_URL ?? "http://localhost:3000";
const INTERNAL_SECRET = process.env.INTERNAL_SECRET ?? "";

export type InboxPayload = {
  type: string;
  actorUrl: string;
  object?: unknown;
  raw: unknown;
};

export async function notifyRails(payload: InboxPayload): Promise<void> {
  const res = await fetch(`${RAILS_INTERNAL_URL}/internal/ap/activity`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${INTERNAL_SECRET}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Rails webhook returned ${res.status} for ${RAILS_INTERNAL_URL}/internal/ap/activity: ${body.slice(0, 500)}`,
    );
  }
}
