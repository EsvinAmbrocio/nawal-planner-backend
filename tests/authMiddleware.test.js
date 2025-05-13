import { describe, it, expect, vi, beforeEach } from 'vitest';
import authMiddleware from '../middleware/authMiddleware';

// Asegúrate de que process.env.API_KEY esté disponible.
// Si ejecutas las pruebas con un script que carga .env (como 'npm test' configurado con dotenv),
// o si Docker pasa las variables de entorno, esto debería funcionar.
const EXPECTED_API_KEY = process.env.API_KEY;

describe('Auth Middleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    // mockReturnThis permite encadenar llamadas como res.status().json()
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    nextFunction = vi.fn();
  });

  it('debería llamar a next() si se proporciona una API Key válida', () => {
    mockRequest.headers.authorization = EXPECTED_API_KEY;

    authMiddleware(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('debería devolver 401 y un error JSON si no se proporciona API Key', () => {
    // mockRequest.headers.authorization ya está vacío/undefined por defecto en beforeEach

    authMiddleware(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error: API Key requerida en el header Authorization.' }); // Corregido el mensaje
  });

  it('debería devolver 403 y un error JSON si se proporciona una API Key inválida', () => {
    mockRequest.headers.authorization = 'INVALID_KEY_123';

    authMiddleware(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(403); // Corregido a 403
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error: API Key inválida.' }); // Corregido el mensaje
  });

  it('debería ser sensible a mayúsculas/minúsculas para la API Key (si la clave real lo es)', () => {
    // Esta prueba asume que la comparación de claves es sensible a mayúsculas/minúsculas.
    if (EXPECTED_API_KEY) {
      mockRequest.headers.authorization = EXPECTED_API_KEY.toLowerCase();
      if (EXPECTED_API_KEY !== EXPECTED_API_KEY.toLowerCase()) { // Solo ejecutar si la clave tiene mayúsculas
        authMiddleware(mockRequest, mockResponse, nextFunction);

        expect(nextFunction).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(403); // Corregido a 403
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error: API Key inválida.' }); // Corregido el mensaje
      } else {
        // Si la API_KEY es toda en minúsculas, esta prueba es redundante con la de API Key válida
        // o la de inválida, dependiendo de si coincide.
        // Para este caso, la marcamos como pasada si la clave es toda minúscula.
        expect(true).toBe(true); // Evita un error de prueba vacía
      }
    } else {
      // Si no hay API_KEY definida, esta prueba no tiene sentido.
      expect(true).toBe(true); // Evita un error de prueba vacía
    }
  });
});
