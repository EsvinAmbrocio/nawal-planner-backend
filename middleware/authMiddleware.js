require('dotenv').config();

const API_KEY = process.env.API_KEY;

function authMiddleware(req, res, next) {
  const userApiKey = req.headers.authorization;

  if (!userApiKey) {
    return res.status(401).json({ message: 'Error: API Key requerida en el header Authorization.' });
  }

  if (!API_KEY) {
    return res.status(500).json({ message: 'Error de configuración del servidor.'});
  }
  const token = String(userApiKey ?? '').split(" ")[1];
  if(!token){
    return res.status(401).json({ message: 'Error: API Key requerida en el header Authorization.' });
  }

  if (token !== API_KEY) {
    return res.status(403).json({ message: 'Error: API Key inválida.' });
  }

  next();
}

module.exports = authMiddleware;
