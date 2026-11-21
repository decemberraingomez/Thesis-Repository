/**
 * Author: Jezreel M. Onos
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

const { AdminUser } = require('../../../backend/dist/models/AdminUser.js');
const { hashPassword } = require('./password');

const DEFAULT_BOOTSTRAP_ADMIN = Object.freeze({
  email: 'admin@ubaguio.edu',
  password: 'ThesisAdmin2026!',
  name: 'Library Administrator',
});

const getBootstrapAdminCredentials = () => ({
  email: (process.env.ADMIN_EMAIL || DEFAULT_BOOTSTRAP_ADMIN.email).trim().toLowerCase(),
  password: process.env.ADMIN_PASSWORD || DEFAULT_BOOTSTRAP_ADMIN.password,
  name: process.env.ADMIN_NAME?.trim() || DEFAULT_BOOTSTRAP_ADMIN.name,
});

const seedBootstrapAdmin = async () => {
  const existingAdmin = await AdminUser.exists({});

  if (existingAdmin) {
    return { created: false, email: null };
  }

  const credentials = getBootstrapAdminCredentials();
  const { passwordHash, passwordSalt } = hashPassword(credentials.password);

  await AdminUser.create({
    email: credentials.email,
    name: credentials.name,
    role: 'admin',
    passwordHash,
    passwordSalt,
    isActive: true,
  });

  return { created: true, email: credentials.email };
};

module.exports = {
  getBootstrapAdminCredentials,
  seedBootstrapAdmin,
};
