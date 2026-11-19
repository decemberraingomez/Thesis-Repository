/**
 * Author: Jezreel M. Onos
 * Date: November 19, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

const express = require('express');
const { createAuthToken, getAdminAccount } = require('../auth/token');
const { requireAdmin } = require('../middleware/requireAdmin');

const router = express.Router();

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

router.post('/login', (req, res) => {
  const identifier = readIdentifier(req.body);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const admin = getAdminAccount();

  if (!identifier || identifier.toLowerCase() !== admin.email || password !== admin.password) {
    return res.status(401).json({ message: 'Invalid admin email or password.' });
  }

  const user = {
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };

  return res.status(200).json({ token: createAuthToken(admin), user });
});

router.get('/me', requireAdmin, (req, res) => {
  return res.status(200).json({ user: req.authUser });
});

module.exports = router;
