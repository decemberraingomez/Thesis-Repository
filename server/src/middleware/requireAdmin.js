/**
 * Author: Jezreel M. Onos
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

const mongoose = require('mongoose');
const { AdminUser } = require('../../../backend/dist/models/AdminUser.js');
const { readBearerToken, verifyAuthToken } = require('../auth/token');

const MISSING_TOKEN_MESSAGE = 'Authentication required. Admin login needed.';
const FORBIDDEN_MESSAGE = 'Forbidden. Admin privileges required.';
const DISABLED_ADMIN_MESSAGE = 'Admin account is disabled.';

const requireAdmin = async (req, res, next) => {
  try {
    const token = readBearerToken(req);

    if (!token) {
      return res.status(401).json({ message: MISSING_TOKEN_MESSAGE });
    }

    const payload = verifyAuthToken(token);

    if (!payload) {
      return res.status(401).json({ message: MISSING_TOKEN_MESSAGE });
    }

    if (payload.role !== 'admin' || !mongoose.isValidObjectId(payload.id)) {
      return res.status(403).json({ message: FORBIDDEN_MESSAGE });
    }

    const admin = await AdminUser.findById(payload.id).exec();

    if (!admin) {
      return res.status(403).json({ message: FORBIDDEN_MESSAGE });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: DISABLED_ADMIN_MESSAGE });
    }

    if (admin.role !== 'admin') {
      return res.status(403).json({ message: FORBIDDEN_MESSAGE });
    }

    req.authUser = {
      id: String(admin._id),
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  DISABLED_ADMIN_MESSAGE,
  FORBIDDEN_MESSAGE,
  MISSING_TOKEN_MESSAGE,
  requireAdmin,
};
