/**
 * Author: Jezreel M. Onos
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

require('dotenv').config();

const mongoose = require('mongoose');
const { AdminUser } = require('../../../backend/dist/models/AdminUser.js');
const {
  getBootstrapAdminCredentials,
} = require('../auth/bootstrapAdmin');
const { hashPassword } = require('../auth/password');

const MIN_PASSWORD_LENGTH = 8;

const readArguments = () => {
  const args = process.argv.slice(2).filter((argument) => argument !== '--');
  return {
    email: args[0]?.trim() ?? '',
    password: args[1] ?? '',
  };
};

const main = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required to reset an administrator.');
  }

  const defaults = getBootstrapAdminCredentials();
  const args = readArguments();
  const email = (args.email || defaults.email).trim().toLowerCase();
  const password = args.password || defaults.password;
  const name = defaults.name;

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const { passwordHash, passwordSalt } = hashPassword(password);
  const existingAdmin = await AdminUser.findOne({ email }).exec();
  let action = 'updated';

  if (existingAdmin) {
    existingAdmin.passwordHash = passwordHash;
    existingAdmin.passwordSalt = passwordSalt;
    existingAdmin.isActive = true;
    await existingAdmin.save();
  } else {
    await AdminUser.create({
      email,
      name,
      role: 'admin',
      passwordHash,
      passwordSalt,
      isActive: true,
    });
    action = 'created';
  }

  console.log(`Administrator ${action} successfully: ${email}`);
};

main()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Admin reset failed:', error.message);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  });
