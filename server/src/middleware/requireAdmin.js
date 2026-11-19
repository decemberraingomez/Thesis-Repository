/**
 * Author: Jezreel M. Onos
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

const { readBearerToken, verifyAuthToken } = require('../auth/token');

const MISSING_TOKEN_MESSAGE = 'Authentication required. Admin login needed.';
const FORBIDDEN_MESSAGE = 'Forbidden. Admin privileges required.';

const requireAdmin = (req, res, next) => {
  const token = readBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: MISSING_TOKEN_MESSAGE });
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    return res.status(401).json({ message: MISSING_TOKEN_MESSAGE });
  }

  if (payload.role !== 'admin') {
    return res.status(403).json({ message: FORBIDDEN_MESSAGE });
  }

  req.authUser = {
    name: payload.name,
    email: payload.email,
    role: payload.role,
  };

  return next();
};

module.exports = { requireAdmin };
