import { createPrivateKey } from "node:crypto";

// Federails stores private keys as PKCS#1 PEM ("-----BEGIN RSA PRIVATE KEY-----")
// and public keys as SPKI PEM ("-----BEGIN PUBLIC KEY-----").
// Web Crypto only accepts PKCS#8 for private keys, so we convert via node:crypto.

function pemBody(pem: string): Uint8Array {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

export async function importPrivateKeyPem(pem: string): Promise<CryptoKey> {
  // node:crypto handles both PKCS#1 and PKCS#8 PEM and exports as PKCS#8 DER
  const nodeKey = createPrivateKey(pem);
  const der = nodeKey.export({ format: "der", type: "pkcs8" }) as Buffer;
  // Wrap in a plain ArrayBuffer to satisfy Web Crypto's strict typing
  const ab = der.buffer.slice(der.byteOffset, der.byteOffset + der.byteLength) as ArrayBuffer;
  return crypto.subtle.importKey(
    "pkcs8",
    ab,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

export async function importPublicKeyPem(pem: string): Promise<CryptoKey> {
  const bytes = pemBody(pem);
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return crypto.subtle.importKey(
    "spki",
    ab,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    true,
    ["verify"],
  );
}
