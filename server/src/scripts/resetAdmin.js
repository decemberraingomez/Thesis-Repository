/**
 * Author: Jezreel M. Onos
 * Date: November 23, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

require('dotenv').config();

const mongoose = require('mongoose');
const { AdminUser } = require('../../../backend/dist/models/AdminUser.js');
const { DEFAULT_ADMIN_NAME } = require('../auth/bootstrapAdmin');
const { hashPassword } = require('../auth/password');

const MIN_PASSWORD_LENGTH = 8;

const readArguments = () => {
  const args = process.argv
    .slice(2)
    .filter((argument) => argument !== '--')
    .map((argument) => argument.replace(/\^!/g, '!'));
  return {
    email: args[0]?.trim().toLowerCase() ?? '',
    password: args[1] ?? '',
  };
};

const main = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required to reset an administrator.');
  }

  const { email, password } = readArguments();

  if (!email) {
    throw new Error('An administrator email is required: npm run admin:reset -- <email> <password>');
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const name = process.env.ADMIN_NAME?.trim() || DEFAULT_ADMIN_NAME;

  await mongoose.connect(process.env.MONGODB_URI);

  const { passwordHash, passwordSalt } = hashPassword(password);
  const existingAdmin = await AdminUser.findOne({ email }).exec();
  let action = 'updated';

  if (existingAdmin) {
    existingAdmin.passwordHash = passwordHash;
    existingAdmin.passwordSalt = passwordSalt;
    existingAdmin.tokenVersion = Number(existingAdmin.tokenVersion ?? 0) + 1;
    existingAdmin.isActive = true;
    await existingAdmin.save();
  } else {
    await AdminUser.create({
      email,
      name,
      role: 'admin',
      passwordHash,
      passwordSalt,
      tokenVersion: 0,
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
