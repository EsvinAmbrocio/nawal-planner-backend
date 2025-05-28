import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import Task from '../models/Task';

const apiKey = process.env.API_KEY;

describe('API de Tareas', () => {
  beforeAll(async () => {
    const testUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
    // Esperar a que la conexión a Mongo esté lista
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Task.deleteMany({});
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
    expect(res.body).toHaveProperty('_id');
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
      const newTask = {
        name: 'Task for GET and DELETE',
        description: 'Temporary task',
        dueDate: '2025-01-01',
      };
      const postRes = await request(app).post('/tasks').set('Authorization', apiKey).send(newTask);
      createdTask = postRes.body;
    });

    it('GET /tasks/:id - debería devolver una tarea específica', async () => {
      const res = await request(app).get(`/tasks/${createdTask._id}`).set('Authorization', apiKey);
      expect(res.statusCode).toEqual(200);
      expect(res.body._id).toEqual(createdTask._id);
      expect(res.body.name).toEqual(createdTask.name);
    });

    it('GET /tasks/:id - debería devolver 404 si la tarea no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/tasks/${fakeId}`).set('Authorization', apiKey);
      expect(res.statusCode).toEqual(404);
    });

    it('DELETE /tasks/:id - debería eliminar una tarea específica', async () => {
      const res = await request(app).delete(`/tasks/${createdTask._id}`).set('Authorization', apiKey);
      expect(res.statusCode).toEqual(204);
      // Verificar que la tarea ya no existe
      const getRes = await request(app).get(`/tasks/${createdTask._id}`).set('Authorization', apiKey);
      expect(getRes.statusCode).toEqual(404);
    });

    it('DELETE /tasks/:id - debería devolver 404 si la tarea a eliminar no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/tasks/${fakeId}`).set('Authorization', apiKey);
      expect(res.statusCode).toEqual(404);
    });
  });
});
