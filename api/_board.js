/* Shared helpers for the board API routes.
   Files prefixed with "_" are bundled but not exposed as routes.

   These are Vercel Node.js functions, so handlers take (req, res) and `req.url`
   is a path rather than an absolute URL — hence readQuery() below.

   A board is a single private blob at boards/<id>.json holding its own credential:

     { v, secretHash, rev, updatedAt, data }

   There is no database. The board id is public-ish (it appears in request URLs);
   the secret is the credential, and only its SHA-256 is ever stored. */

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { get, put } from '@vercel/blob';

export const BOARD_VERSION = 1;
export const MAX_BOARD_BYTES = 2 * 1024 * 1024;   // board JSON carries no image bytes
export const ID_RE = /^[A-Za-z0-9_-]{16,64}$/;

export const boardPath = id => `boards/${id}.json`;
export const assetPath = (id, assetId) => `boards/${id}/${assetId}`;

export const newToken = () => randomBytes(16).toString('base64url');   // 128-bit
export const sha256 = s => createHash('sha256').update(String(s)).digest();

export function secretMatches(secret, storedHashHex) {
  if (!secret || !storedHashHex) return false;
  const a = sha256(secret);
  let b;
  try { b = Buffer.from(storedHashHex, 'hex'); } catch { return false; }
  return a.length === b.length && timingSafeEqual(a, b);
}

/* req.query is populated by Vercel, but fall back to parsing the path ourselves. */
export function readQuery(req, key) {
  if (req.query && req.query[key] != null) return String(req.query[key]);
  try { return new URL(req.url, 'http://localhost').searchParams.get(key) || ''; }
  catch { return ''; }
}

export function json(res, body, status = 200) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

/* The board secret travels in a header, never the query string, so it stays out of
   request logs. The client keeps it in the URL fragment, which is never sent at all. */
export const readSecret = req => req.headers['x-board-secret'] || '';

/* Vercel parses JSON bodies, but be tolerant of a raw string or an unread stream. */
export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return null;
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return null; }
}

/* Reads the board with useCache:false — a poll must never see a stale write. */
export async function readBoard(id) {
  let res;
  try {
    res = await get(boardPath(id), { access: 'private', useCache: false });
  } catch {
    return null;
  }
  if (!res || res.statusCode !== 200) return null;
  try {
    const text = await new Response(res.stream).text();
    return { board: JSON.parse(text), etag: res.blob.etag };
  } catch {
    return null;
  }
}

export async function writeBoard(id, board, { ifMatch, allowOverwrite = true } = {}) {
  return put(boardPath(id), JSON.stringify(board), {
    access: 'private',
    contentType: 'application/json',
    allowOverwrite,
    addRandomSuffix: false,
    cacheControlMaxAge: 0,   // paired with useCache:false reads, so saves are seen immediately
    ...(ifMatch ? { ifMatch } : {}),
  });
}

/* Loads a board and checks the caller's secret in one step.
   Returns { denied: true } after responding, so routes can just bail out. */
export async function authBoard(req, res, id) {
  if (!id || !ID_RE.test(id)) { json(res, { error: 'bad board id' }, 400); return { denied: true }; }
  const found = await readBoard(id);
  // Same response for "no such board" and "wrong secret" — don't confirm a board exists
  // to someone who can't open it.
  if (!found || !secretMatches(readSecret(req), found.board.secretHash)) {
    json(res, { error: 'not found' }, 404);
    return { denied: true };
  }
  return found;
}
