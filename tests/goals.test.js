import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import Goal from '../models/Goal';

const apiKey = process.env.API_KEY;

describe('API de Metas', () => {
  beforeAll(async () => {
    const testUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
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
    await Goal.deleteMany({});
  });

  it('GET /goals - debería devolver un array vacío inicialmente (después de la limpieza)', async () => {
    const res = await request(app).get('/goals').set('Authorization', apiKey);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toEqual(0);
  });

  it('POST /goals - debería crear una nueva meta', async () => {
    const newGoal = {
      name: 'Test Goal',
      description: 'Test Description for Goal',
      dueDate: '2025-11-30',
    };
    const res = await request(app).post('/goals').set('Authorization', apiKey).send(newGoal);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe(newGoal.name);
    expect(res.body.description).toBe(newGoal.description);
    expect(res.body.dueDate).toBe(newGoal.dueDate);

    // Verificar que la meta está en la lista
    const getRes = await request(app).get('/goals').set('Authorization', apiKey);
    expect(getRes.body.length).toEqual(1);
    expect(getRes.body[0].name).toBe(newGoal.name);
  });

  it('POST /goals - debería devolver 400 si faltan campos', async () => {
    const incompleteGoal = {
      name: 'Incomplete Goal',
    };
    const res = await request(app).post('/goals').set('Authorization', apiKey).send(incompleteGoal);
    expect(res.statusCode).toEqual(400);
  });

  describe('Operaciones sobre una meta existente', () => {
    let createdGoal;

    beforeEach(async () => {
      const newGoalData = {
        name: 'Goal for GET and DELETE',
        description: 'Temporary goal',
        dueDate: '2025-02-01',
      };
      const postRes = await request(app).post('/goals').set('Authorization', apiKey).send(newGoalData);
      createdGoal = postRes.body;
    });

    it('GET /goals/:id - debería devolver una meta específica', async () => {
      const res = await request(app).get(`/goals/${createdGoal._id}`).set('Authorization', apiKey);
      expect(res.statusCode).toEqual(200);
      expect(res.body._id).toEqual(createdGoal._id);
      expect(res.body.name).toEqual(createdGoal.name);
    });

    it('GET /goals/:id - debería devolver 404 si la meta no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/goals/${fakeId}`).set('Authorization', apiKey);
      expect(res.statusCode).toEqual(404);
    });

    it('DELETE /goals/:id - debería eliminar una meta específica', async () => {
      const res = await request(app).delete(`/goals/${createdGoal._id}`).set('Authorization', apiKey);
      expect(res.statusCode).toEqual(204);
      // Verificar que la meta ya no existe
      const getRes = await request(app).get(`/goals/${createdGoal._id}`).set('Authorization', apiKey);
      expect(getRes.statusCode).toEqual(404);
    });

    it('DELETE /goals/:id - debería devolver 404 si la meta a eliminar no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/goals/${fakeId}`).set('Authorization', apiKey);
      expect(res.statusCode).toEqual(404);
    });
  });
});
