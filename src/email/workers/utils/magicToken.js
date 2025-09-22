const jwt = require('jsonwebtoken');

function createMagicToken(razonSocial) {
  const secret = process.env.MAGIC_TOKEN_SECRET || 'super_secret_key';
  const expiresIn = '2d'; 

  return jwt.sign({ razonSocial }, secret, { expiresIn });
}

module.exports = { createMagicToken };
