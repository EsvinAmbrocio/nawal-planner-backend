require('dotenv').config(); // Cargar variables de entorno desde .env

const API_KEY = process.env.API_KEY; // Cargar desde la variable de entorno

function authMiddleware(req, res, next) {
  const userApiKey = req.headers.authorization;

  if (!userApiKey) {
    return res.status(401).json({ message: 'Error: API Key requerida en el header Authorization.' });
  }

  if (!API_KEY) { // Verificar si la API_KEY se cargó correctamente desde .env
    console.error('Error: La variable de entorno API_KEY no está configurada en el servidor.');
    return res.status(500).json({ message: 'Error de configuración del servidor.'});
  }

  if (userApiKey !== API_KEY) {
    return res.status(403).json({ message: 'Error: API Key inválida.' });
  }

  next();
}

module.exports = authMiddleware;
