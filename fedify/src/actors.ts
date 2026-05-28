import { Application, type Context, Endpoints, Image } from "@fedify/fedify";
import { sql, type InstanceActorRow } from "./db.ts";
import { importPrivateKeyPem, importPublicKeyPem } from "./keys.ts";

async function fetchInstanceActor(): Promise<InstanceActorRow | null> {
  const rows = await sql<InstanceActorRow[]>`
    SELECT id, name, public_key, private_key
    FROM instance_actors
    WHERE public_key IS NOT NULL
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function actorDispatcher(
  ctx: Context<void>,
  identifier: string,
): Promise<Application | null> {
  if (identifier !== "instance") return null;

  const actor = await fetchInstanceActor();
  if (!actor) return null;

  const appHost = process.env.APP_HOST ?? "";

  return new Application({
    id: ctx.getActorUri(identifier),
    name: actor.name,
    preferredUsername: actor.name,
    summary: "We recommend hiding Boosts from us",
    url: new URL(`https://${appHost}`),
    inbox: ctx.getInboxUri(identifier),
    followers: ctx.getFollowersUri(identifier),
    endpoints: new Endpoints({ sharedInbox: ctx.getInboxUri() }),
    icon: new Image({
      mediaType: "image/png",
      url: new URL(`https://${appHost}/assets/instance-logo.png`),
    }),
  });
}

export async function keyPairsDispatcher(
  _ctx: Context<void>,
  identifier: string,
): Promise<CryptoKeyPair[]> {
  if (identifier !== "instance") return [];

  const actor = await fetchInstanceActor();
  if (!actor?.private_key || !actor?.public_key) return [];

  const [privateKey, publicKey] = await Promise.all([
    importPrivateKeyPem(actor.private_key),
    importPublicKeyPem(actor.public_key),
  ]);

  return [{ privateKey, publicKey }];
}
