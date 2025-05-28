var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const mongoose = require('mongoose');
require('dotenv').config(); // Cargar variables de entorno

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const tasksRouter = require('./routes/tasks');
const goalsRouter = require('./routes/goals');
const authMiddleware = require('./middleware/authMiddleware');

var app = express();

// Conexión a MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:example@mongo:27017/nawal?authSource=admin';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Configuración de Swagger JSDoc
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Tareas y Metas',
      version: '1.0.0',
      description: 
        'Documentación de la API para gestionar tareas y metas.\n\n' +
        '**Autenticación:** Los endpoints bajo `/tasks` y `/goals` requieren una API Key para la autorización. ' +
        'Deberás incluir tu API Key en el header `Authorization`.\n\n' +
        '**Uso en Swagger UI:**\n' +
        '1. Haz clic en el botón verde **"Authorize"** que se encuentra debajo de esta descripción (o en el candado de un endpoint protegido).\n' +
        '2. En el diálogo "Available authorizations", ingresa tu API Key en el campo "Value" para la scheme `ApiKeyAuth`.\n' +
        '3. Haz clic en "Authorize" y luego en "Close". Ahora podrás probar los endpoints protegidos.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: { // Nombre usado en la anotación 'security' de las rutas
          type: 'apiKey',
          in: 'header',
          name: 'Authorization', // Nombre del header donde se enviará la API Key
          description: 'API Key para autenticar las solicitudes a los endpoints protegidos (`/tasks` y `/goals`).\n\n' +
                       '**Instrucciones:** Ingresa tu API Key directamente. No incluyas prefijos como "Bearer ".\n' +
                       'Ejemplo: `SUA_CHAVE_API_SECRETA`'
        }
      }
    }
    // Se elimina la seguridad global de aquí para aplicarla específicamente en las rutas que lo necesiten (tasks y goals)
    // security: [
    //   {
    //     ApiKeyAuth: [] 
    //   }
    // ]
  },
  apis: ['./routes/*.js'], // Archivos que contienen las anotaciones para Swagger
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas públicas
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Middleware de Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas protegidas por API Key
app.use('/tasks', authMiddleware, tasksRouter);
app.use('/goals', authMiddleware, goalsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
