const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_rwave_jwt_key_change_in_prod'
    );
    req.admin = decoded;
    next();
  } catch (err) { console.error(err);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

module.exports = {
  verifyAdmin,
};
