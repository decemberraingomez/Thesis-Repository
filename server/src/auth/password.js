/**
 * Author: Jezreel M. Onos
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

const crypto = require('crypto');

const SALT_BYTES = 16;
const KEY_LENGTH = 64;

const createPasswordSalt = () => crypto.randomBytes(SALT_BYTES).toString('hex');

const hashPassword = (password, salt = createPasswordSalt()) => ({
  passwordSalt: salt,
  passwordHash: crypto.scryptSync(password, salt, KEY_LENGTH).toString('hex'),
});

const verifyPassword = (password, passwordHash, passwordSalt) => {
  if (
    typeof password !== 'string' ||
    typeof passwordHash !== 'string' ||
    typeof passwordSalt !== 'string'
  ) {
    return false;
  }

  try {
    const storedHash = Buffer.from(passwordHash, 'hex');

    if (storedHash.length !== KEY_LENGTH) {
      return false;
    }

    const candidateHash = crypto.scryptSync(password, passwordSalt, KEY_LENGTH);
    return crypto.timingSafeEqual(storedHash, candidateHash);
  } catch {
    return false;
  }
};

module.exports = {
  createPasswordSalt,
  hashPassword,
  verifyPassword,
};
