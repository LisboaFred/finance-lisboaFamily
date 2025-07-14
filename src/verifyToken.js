const jwt = require('jsonwebtoken');

function verify(req, res, next) {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json("Token inválido!");
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("Você não está autenticado!");
  }
}

module.exports = verify;
