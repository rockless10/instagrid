/* /api/board — create, read, save and re-key a board.

   POST                  → mint a new board, returns { id, secret }
   GET   ?id=…           → { rev, updatedAt, data, assetUrls }
   PUT   ?id=…           → save; body { rev, data } → { rev }, or 409 if rev is stale
   PATCH ?id=…           → rotate the secret, returns { secret }

   The secret always travels in the x-board-secret header. */

import { issueSignedToken, presignUrl } from '@vercel/blob';
import {
  BOARD_VERSION, MAX_BOARD_BYTES, assetPath, authBoard, json,
  newToken, readJsonBody, readQuery, sha256, writeBoard,
} from './_board.js';

const ASSET_URL_TTL = 60 * 60 * 1000;   // 1 hour — the client refetches the board well within this

/* issueSignedToken() only accepts a concrete pathname or a bare "*", so the read
   delegation is store-wide. That token never leaves this function: what the browser
   receives is presignUrl() output, and each of those URLs is signed for one exact
   pathname, so a link to one board's photo cannot be edited into another's.
   Cached between invocations because minting one is a control-API round-trip. */
let readToken = null, readTokenUntil = 0;
async function getReadToken() {
  const now = Date.now();
  if (readToken && readTokenUntil - now > 5 * 60 * 1000) return readToken;
  readTokenUntil = now + ASSET_URL_TTL;
  readToken = await issueSignedToken({ pathname: '*', operations: ['get'], validUntil: readTokenUntil });
  return readToken;
}

/* Presigned GET URLs let the browser pull photos straight from the CDN instead of
   streaming every byte back through this function. */
async function assetUrls(id, data) {
  const assets = (data && Array.isArray(data.assets)) ? data.assets : [];
  const withPath = assets.filter(a => a && a.id && a.path);
  if (!withPath.length) return {};

  const token = await getReadToken();
  const validUntil = Math.min(Date.now() + ASSET_URL_TTL, readTokenUntil);

  const out = {};
  await Promise.all(withPath.map(async a => {
    try {
      const { presignedUrl } = await presignUrl(token, {
        operation: 'get',
        pathname: assetPath(id, a.id),
        access: 'private',
        validUntil,
      });
      out[a.id] = presignedUrl;
    } catch { /* a missing asset shouldn't sink the whole board load */ }
  }));
  return out;
}

export default async function handler(req, res) {
  const id = readQuery(req, 'id');

  /* ---- create ---- */
  if (req.method === 'POST') {
    const newId = newToken(), secret = newToken();
    const board = {
      v: BOARD_VERSION,
      secretHash: sha256(secret).toString('hex'),
      rev: 1,
      updatedAt: new Date().toISOString(),
      data: null,
    };
    try {
      // allowOverwrite:false — a fresh id must never land on top of an existing board
      await writeBoard(newId, board, { allowOverwrite: false });
    } catch {
      return json(res, { error: 'could not create board' }, 500);
    }
    return json(res, { id: newId, secret, rev: 1 });
  }

  /* ---- read ---- */
  if (req.method === 'GET') {
    const found = await authBoard(req, res, id);
    if (found.denied) return;
    const { board, etag } = found;
    return json(res, {
      rev: board.rev || 1,
      etag,
      updatedAt: board.updatedAt || null,
      data: board.data || null,
      assetUrls: await assetUrls(id, board.data),
    });
  }

  /* ---- save ---- */
  if (req.method === 'PUT') {
    const found = await authBoard(req, res, id);
    if (found.denied) return;

    const body = await readJsonBody(req);
    if (!body || typeof body.data !== 'object' || body.data === null) {
      return json(res, { error: 'bad body' }, 400);
    }

    const payload = JSON.stringify(body.data);
    if (payload.length > MAX_BOARD_BYTES) {
      // Only ever the layout + asset metadata; image bytes live in their own blobs.
      return json(res, { error: 'board too large' }, 413);
    }

    // The caller tells us which revision it edited. If the board has moved on since
    // then, someone else saved first and we refuse rather than clobber them.
    //
    // The check is on our own `rev` counter rather than the blob ETag. Blob returns a
    // weak ETag (W/"…") once a board is large enough to be gzipped and a strong one
    // below that, so `ifMatch` silently stops matching as a board fills up — it turned
    // every save into a false conflict. The tradeoff of dropping it: a second write
    // landing in the few milliseconds between our read and our write would be
    // overwritten. For two devices belonging to one person, real conflicts are seconds
    // or minutes apart and the rev check catches all of them.
    const current = found.board.rev || 1;
    if (body.rev != null && Number(body.rev) !== current) {
      return json(res, { error: 'conflict', rev: current }, 409);
    }

    const next = {
      v: BOARD_VERSION,
      secretHash: found.board.secretHash,
      rev: current + 1,
      updatedAt: new Date().toISOString(),
      data: body.data,
    };

    try {
      await writeBoard(id, next);
      return json(res, { rev: next.rev, updatedAt: next.updatedAt });
    } catch {
      return json(res, { error: 'could not save' }, 500);
    }
  }

  /* ---- rotate the secret ---- */
  // The only recourse if a board link leaks. Every existing link stops working,
  // including the caller's own other devices, which then need the new link.
  if (req.method === 'PATCH') {
    const found = await authBoard(req, res, id);
    if (found.denied) return;

    const secret = newToken();
    const next = {
      ...found.board,
      v: BOARD_VERSION,
      secretHash: sha256(secret).toString('hex'),
      rev: (found.board.rev || 1) + 1,
      updatedAt: new Date().toISOString(),
    };
    try {
      await writeBoard(id, next);
      return json(res, { secret, rev: next.rev });
    } catch {
      return json(res, { error: 'could not rotate' }, 500);
    }
  }

  return json(res, { error: 'method not allowed' }, 405);
}
