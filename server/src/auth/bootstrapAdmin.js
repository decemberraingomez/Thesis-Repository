/**
 * Author: Jezreel M. Onos
 * Date: November 23, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

const { AdminUser } = require('../../../backend/dist/models/AdminUser.js');
const { hashPassword } = require('./password');

const DEFAULT_ADMIN_NAME = 'Library Administrator';

const getBootstrapAdminCredentials = () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? '';
  const password = typeof process.env.ADMIN_PASSWORD === 'string' ? process.env.ADMIN_PASSWORD : '';

  if (!email || password.trim().length === 0) {
    return null;
  }

  return {
    email,
    password,
    name: process.env.ADMIN_NAME?.trim() || DEFAULT_ADMIN_NAME,
  };
};

const seedBootstrapAdmin = async () => {
  const existingAdmin = await AdminUser.exists({});

  if (existingAdmin) {
    return { created: false, email: null, skipped: false };
  }

  const credentials = getBootstrapAdminCredentials();

  if (!credentials) {
    return { created: false, email: null, skipped: true };
  }

  const { passwordHash, passwordSalt } = hashPassword(credentials.password);

  await AdminUser.create({
    email: credentials.email,
    name: credentials.name,
    role: 'admin',
    passwordHash,
    passwordSalt,
    tokenVersion: 0,
    isActive: true,
  });

  return { created: true, email: credentials.email, skipped: false };
};

module.exports = {
  DEFAULT_ADMIN_NAME,
  getBootstrapAdminCredentials,
  seedBootstrapAdmin,
};
