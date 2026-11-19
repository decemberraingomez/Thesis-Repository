/**
 * Author: Jezreel M. Onos
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

const crypto = require('crypto');

const DEFAULT_ADMIN = Object.freeze({
  name: 'Library Administrator',
  email: 'admin@ubaguio.edu',
  password: 'ThesisAdmin2026!',
  role: 'admin',
});

const DEFAULT_AUTH_SECRET = 'ub-thesis-repo-secret-2026';
const TOKEN_TTL_SECONDS = 60 * 60 * 8;

const getAuthSecret = () => process.env.AUTH_SECRET || DEFAULT_AUTH_SECRET;

const getAdminAccount = () => ({
  name: process.env.ADMIN_NAME?.trim() || DEFAULT_ADMIN.name,
  email: (process.env.ADMIN_EMAIL || DEFAULT_ADMIN.email).trim().toLowerCase(),
  password: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN.password,
  role: DEFAULT_ADMIN.role,
});

const toBase64Url = (value) => Buffer.from(value).toString('base64url');

const sign = (value) =>
  crypto.createHmac('sha256', getAuthSecret()).update(value).digest('base64url');

const createAuthToken = (account) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    sub: account.email,
    email: account.email,
    name: account.name,
    role: account.role,
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
      typeof payload.email !== 'string' ||
      typeof payload.role !== 'string' ||
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
  createAuthToken,
  getAdminAccount,
  readBearerToken,
  verifyAuthToken,
};
