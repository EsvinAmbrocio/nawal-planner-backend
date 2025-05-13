import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app'; // Importamos la app de Express

const apiKey = process.env.API_KEY; // Cargar API Key

describe('API de Tareas', () => {
  let server;

  beforeAll(() => {
    // Es una buena práctica iniciar el servidor antes de las pruebas
    // y cerrarlo después, aunque supertest puede manejar esto a menudo.
    // Para este ejemplo, dejaremos que supertest maneje el servidor por simplicidad.
  });

  afterAll(() => {
    // Aquí podrías cerrar el servidor si lo iniciaste manualmente.
  });

  // Limpiar las tareas antes de cada prueba para asegurar un estado limpio
  beforeEach(async () => {
    // Dado que las tareas se almacenan en memoria en el router,
    // necesitamos una forma de limpiarlas. Esto es una limitación
    // de nuestro almacenamiento en memoria simple para pruebas.
    // En una app real con base de datos, limpiarías la BD o usarías transacciones.
    // Por ahora, asumiremos que cada prueba comienza con un estado limpio o
    // probaremos las rutas de forma que el estado anterior no interfiera demasiado.
    // Una mejor aproximación sería exportar el array `tasks` y `nextTaskId` desde
    // `routes/tasks.js` para poder resetearlos aquí, o añadir un endpoint de testeo para resetear.

    // Solución simple (pero no ideal para producción) para resetear el estado en memoria:
    // Se necesitaría modificar tasks.js para exportar y permitir la modificación de 'tasks' y 'nextTaskId'
    // o añadir un endpoint de limpieza solo para tests.
    // Por ahora, las pruebas se escribirán asumiendo un estado secuencial o se enfocarán en la funcionalidad.

    // Ejemplo de cómo se podría hacer si tasks.js exportara el array:
    // (Esto requeriría cambios en routes/tasks.js)
    // import { tasks_for_test as tasks, reset_next_id_for_test as resetNextTaskId } from '../routes/tasks';
    // tasks.length = 0; // Vaciar el array
    // resetNextTaskId(); // Resetear el contador de ID

    // Como no tenemos un reseteo fácil, probaremos GET /tasks primero para ver el estado inicial.
    const res = await request(app).get('/tasks').set('Authorization', apiKey);
    const initialTasks = res.body;
    // Verificar que initialTasks es un array antes de iterar
    if (Array.isArray(initialTasks)) {
      for (const task of initialTasks) {
        await request(app).delete(`/tasks/${task.id}`).set('Authorization', apiKey);
      }
    }
  });

  it('GET /tasks - debería devolver un array vacío inicialmente (después de la limpieza)', async () => {
    const res = await request(app).get('/tasks').set('Authorization', apiKey);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toEqual(0);
  });

  it('POST /tasks - debería crear una nueva tarea', async () => {
    const newTask = {
      name: 'Test Task',
      description: 'Test Description',
      dueDate: '2025-12-31',
    };
    const res = await request(app).post('/tasks').set('Authorization', apiKey).send(newTask);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(newTask.name);
    expect(res.body.description).toBe(newTask.description);
    expect(res.body.dueDate).toBe(newTask.dueDate);

    // Verificar que la tarea está en la lista
    const getRes = await request(app).get('/tasks').set('Authorization', apiKey);
    expect(getRes.body.length).toEqual(1);
    expect(getRes.body[0].name).toBe(newTask.name);
  });

  it('POST /tasks - debería devolver 400 si faltan campos', async () => {
    const incompleteTask = {
      name: 'Incomplete Task',
    };
    const res = await request(app).post('/tasks').set('Authorization', apiKey).send(incompleteTask);
    expect(res.statusCode).toEqual(400);
  });

  describe('Operaciones sobre una tarea existente', () => {
    let createdTask;

    beforeEach(async () => {
      // Crear una tarea para las pruebas de GET por ID y DELETE
      const newTask = {
        name: 'Task for GET and DELETE',
        description: 'Temporary task',
        dueDate: '2025-01-01',
      };
      const postRes = await request(app).post('/tasks').set('Authorization', apiKey).send(newTask);
      createdTask = postRes.body;
    });

    it('GET /tasks/:id - debería devolver una tarea específica', async () => {
      const res = await request(app).get(`/tasks/${createdTask.id}`).set('Authorization', apiKey);
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(createdTask.id);
      expect(res.body.name).toEqual(createdTask.name);
    });

    it('GET /tasks/:id - debería devolver 404 si la tarea no existe', async () => {
      const res = await request(app).get('/tasks/9999').set('Authorization', apiKey); // ID que no existe
      expect(res.statusCode).toEqual(404);
    });

    it('DELETE /tasks/:id - debería eliminar una tarea específica', async () => {
      const res = await request(app).delete(`/tasks/${createdTask.id}`).set('Authorization', apiKey);
      expect(res.statusCode).toEqual(204);

      // Verificar que la tarea ya no existe
      const getRes = await request(app).get(`/tasks/${createdTask.id}`).set('Authorization', apiKey);
      expect(getRes.statusCode).toEqual(404);
    });

    it('DELETE /tasks/:id - debería devolver 404 si la tarea a eliminar no existe', async () => {
      const res = await request(app).delete('/tasks/9998').set('Authorization', apiKey); // ID que no existe
      expect(res.statusCode).toEqual(404);
    });
  });
});
