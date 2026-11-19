/**
 * Author: Jezreel M. Onos
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

const express = require('express');
const { AdminUser } = require('../../../backend/dist/models/AdminUser.js');
const { createAuthToken } = require('../auth/token');
const { hashPassword, verifyPassword } = require('../auth/password');
const {
  DISABLED_ADMIN_MESSAGE,
  FORBIDDEN_MESSAGE,
  requireAdmin,
} = require('../middleware/requireAdmin');

const router = express.Router();

const INVALID_CREDENTIALS_MESSAGE = 'Invalid admin email or password.';
const MIN_PASSWORD_LENGTH = 8;

const readIdentifier = (body) => {
  if (typeof body !== 'object' || body === null) {
    return '';
  }

  if (typeof body.email === 'string' && body.email.trim().length > 0) {
    return body.email.trim();
  }

  if (typeof body.username === 'string' && body.username.trim().length > 0) {
    return body.username.trim();
  }

  return '';
};

const toAuthUser = (admin) => ({
  id: String(admin._id),
  name: admin.name,
  email: admin.email,
  role: admin.role,
});

router.post('/login', async (req, res, next) => {
  try {
    const identifier = readIdentifier(req.body);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!identifier || !password) {
      return res.status(401).json({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    const admin = await AdminUser.findOne({ email: identifier.toLowerCase() }).exec();

    if (!admin) {
      return res.status(401).json({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: DISABLED_ADMIN_MESSAGE });
    }

    if (!verifyPassword(password, admin.passwordHash, admin.passwordSalt)) {
      return res.status(401).json({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    return res.status(200).json({
      token: createAuthToken(admin),
      user: toAuthUser(admin),
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAdmin, (req, res) => {
  return res.status(200).json({ user: req.authUser });
});

router.put('/password', requireAdmin, async (req, res, next) => {
  try {
    const currentPassword =
      typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is required.' });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res
        .status(400)
        .json({ message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }

    const admin = await AdminUser.findById(req.authUser.id).exec();

    if (!admin) {
      return res.status(403).json({ message: FORBIDDEN_MESSAGE });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: DISABLED_ADMIN_MESSAGE });
    }

    if (!verifyPassword(currentPassword, admin.passwordHash, admin.passwordSalt)) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const { passwordHash, passwordSalt } = hashPassword(newPassword);
    admin.passwordHash = passwordHash;
    admin.passwordSalt = passwordSalt;
    await admin.save();

    return res.status(200).json({ message: 'Admin password updated successfully.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
