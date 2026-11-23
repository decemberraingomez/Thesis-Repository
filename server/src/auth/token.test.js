/**
 * Author: Jezreel M. Onos
 * Date: November 23, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

const assert = require('node:assert/strict');
const test = require('node:test');

const { assertAuthSecret, createAuthToken, verifyAuthToken } = require('./token');

const TEST_SECRET = 'unit-test-only-secret-value';
const ADMIN_ACCOUNT = {
  id: '65f1d1f1f1f1f1f1f1f1f1f1f',
  email: 'admin@example.edu',
  name: 'Library Administrator',
  role: 'admin',
  tokenVersion: 3,
};

const withSecret = (secret, run) => {
  const previous = process.env.AUTH_SECRET;

  if (secret === undefined) {
    delete process.env.AUTH_SECRET;
  } else {
    process.env.AUTH_SECRET = secret;
  }

  try {
    run();
  } finally {
    if (previous === undefined) {
      delete process.env.AUTH_SECRET;
    } else {
      process.env.AUTH_SECRET = previous;
    }
  }
};

test('throws when AUTH_SECRET is missing', () => {
  withSecret(undefined, () => {
    assert.throws(() => assertAuthSecret(), /AUTH_SECRET environment variable is required/);
    assert.throws(() => createAuthToken(ADMIN_ACCOUNT), /AUTH_SECRET environment variable is required/);
  });
});

test('throws when AUTH_SECRET is blank', () => {
  withSecret('   ', () => {
    assert.throws(() => assertAuthSecret(), /AUTH_SECRET environment variable is required/);
  });
});

test('embeds tokenVersion in signed tokens', () => {
  withSecret(TEST_SECRET, () => {
    const payload = verifyAuthToken(createAuthToken(ADMIN_ACCOUNT));

    assert.ok(payload);
    assert.equal(payload.tokenVersion, ADMIN_ACCOUNT.tokenVersion);
    assert.equal(payload.id, ADMIN_ACCOUNT.id);
  });
});

test('rejects tokens signed with a different secret', () => {
  withSecret(TEST_SECRET, () => {
    const token = createAuthToken(ADMIN_ACCOUNT);

    withSecret('rotated-unit-test-secret', () => {
      assert.equal(verifyAuthToken(token), null);
    });
  });
});
