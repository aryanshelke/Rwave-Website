const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const validUser = process.env.ADMIN_USER || 'admin';
  const validPass = process.env.ADMIN_PASS || 'rwave_admin_2026';
  const jwtSecret = process.env.JWT_SECRET || 'super_secret_rwave_jwt_key_change_in_prod';

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.',
    });
  }

  if (username !== validUser || password !== validPass) {
    return res.status(401).json({
      success: false,
      message: 'Invalid administrative credentials.',
    });
  }

  const token = jwt.sign(
    {
      username,
      role: 'admin',
    },
    jwtSecret,
    {
      expiresIn: '24h',
    }
  );

  return res.json({
    success: true,
    message: 'Authentication successful.',
    token,
    user: {
      username,
      role: 'admin',
    },
  });
});

module.exports = router;

