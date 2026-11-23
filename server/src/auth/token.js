/**
 * Author: Jezreel M. Onos
 * Date: November 23, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

const crypto = require('crypto');

const TOKEN_TTL_SECONDS = 60 * 60 * 8;
const MISSING_SECRET_MESSAGE =
  'AUTH_SECRET environment variable is required to sign and verify admin tokens.';

const getAuthSecret = () => {
  const secret = process.env.AUTH_SECRET;

  if (typeof secret !== 'string' || secret.trim().length === 0) {
    throw new Error(MISSING_SECRET_MESSAGE);
  }

  return secret.trim();
};

const assertAuthSecret = () => {
  getAuthSecret();
  return true;
};

const toBase64Url = (value) => Buffer.from(value).toString('base64url');

const sign = (value) =>
  crypto.createHmac('sha256', getAuthSecret()).update(value).digest('base64url');

const createAuthToken = (account) => {
  const accountId = account?.id ?? account?._id;

  if (!accountId) {
    throw new Error('Admin id is required to create a token');
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    id: String(accountId),
    email: account.email,
    name: account.name,
    role: account.role,
    tokenVersion: Number(account.tokenVersion ?? 0),
    iat: issuedAt,
    exp: issuedAt + TOKEN_TTL_SECONDS,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
};

const signaturesMatch = (left, right) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const verifyAuthToken = (token) => {
  if (typeof token !== 'string') {
    return null;
  }

  const [encodedPayload, signature, ...rest] = token.split('.');

  if (!encodedPayload || !signature || rest.length > 0) {
    return null;
  }

  if (!signaturesMatch(signature, sign(encodedPayload))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));

    if (
      typeof payload !== 'object' ||
      payload === null ||
      typeof payload.id !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.role !== 'string' ||
      typeof payload.tokenVersion !== 'number' ||
      !Number.isInteger(payload.tokenVersion) ||
      typeof payload.exp !== 'number'
    ) {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

const readBearerToken = (req) => {
  const header = req.headers.authorization;

  if (typeof header !== 'string') {
    return null;
  }

  const [scheme, value, ...rest] = header.trim().split(/\s+/);

  if (scheme?.toLowerCase() !== 'bearer' || !value || rest.length > 0) {
    return null;
  }

  return value;
};

module.exports = {
  assertAuthSecret,
  createAuthToken,
  readBearerToken,
  verifyAuthToken,
};
