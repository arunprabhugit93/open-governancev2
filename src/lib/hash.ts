/**
 * Real client-side SHA-256 hashing. The evidence ledger is chained with these
 * digests, so tampering with any record genuinely breaks verification of that
 * record and every record after it. This is deliberately NOT simulated — it is
 * the part of claim C7 (tamper-evident custody) we can honestly demonstrate in
 * a UI-only POC.
 */

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Deterministic, key-sorted serialisation so hashes are stable. */
export function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(obj[k])}`).join(',')}}`;
}

export async function chainHash(prevHash: string, payload: unknown): Promise<string> {
  return sha256Hex(prevHash + '|' + canonical(payload));
}

export function shortHash(hash: string, head = 8, tail = 6): string {
  if (hash.length <= head + tail + 1) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

export const GENESIS_HASH = '0'.repeat(64);
