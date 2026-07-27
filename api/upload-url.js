/* /api/upload-url — hand the browser a presigned PUT URL for one photo.

   POST ?id=…  body { assetId, contentType, size }  → { url, path }

   The bytes go browser → Blob directly, so nothing is capped by the 4.5 MB function
   body limit and no image data passes through this function. The URL is scoped to a
   single pathname, one content type and a size ceiling, all enforced at the CDN, so
   it stays safe in the browser even though the browser controls the request body. */

import { issueSignedToken, presignUrl } from '@vercel/blob';
import { assetPath, authBoard, json, readJsonBody, readQuery } from './_board.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 25 * 1024 * 1024;
const URL_TTL = 10 * 60 * 1000;
const ASSET_ID_RE = /^[A-Za-z0-9._-]{1,120}$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, { error: 'method not allowed' }, 405);

  const id = readQuery(req, 'id');
  const found = await authBoard(req, res, id);
  if (found.denied) return;

  const body = await readJsonBody(req);
  if (!body) return json(res, { error: 'bad body' }, 400);

  const assetId = body.assetId;
  const contentType = body.contentType || 'image/jpeg';
  const size = Number(body.size) || 0;

  if (!assetId || !ASSET_ID_RE.test(assetId)) return json(res, { error: 'bad assetId' }, 400);
  if (!ALLOWED.includes(contentType)) return json(res, { error: 'unsupported type' }, 415);
  if (size > MAX_BYTES) return json(res, { error: 'too large' }, 413);

  const pathname = assetPath(id, assetId);
  const validUntil = Date.now() + URL_TTL;

  try {
    const token = await issueSignedToken({
      pathname,
      operations: ['put'],
      allowedContentTypes: [contentType],
      maximumSizeInBytes: MAX_BYTES,
      validUntil,
    });
    const { presignedUrl } = await presignUrl(token, {
      operation: 'put',
      pathname,
      access: 'private',
      allowedContentTypes: [contentType],
      maximumSizeInBytes: MAX_BYTES,
      addRandomSuffix: false,
      // photos are written once under their own id; re-uploading the same id is a retry
      allowOverwrite: true,
      cacheControlMaxAge: 30 * 24 * 60 * 60,
      validUntil,
    });
    return json(res, { url: presignedUrl, path: pathname, contentType });
  } catch {
    return json(res, { error: 'could not sign upload' }, 500);
  }
}
