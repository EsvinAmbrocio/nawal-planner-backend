import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app'; // Importamos la app de Express

const apiKey = process.env.API_KEY; // Cargar API Key

describe('API de Metas', () => {
  // Limpiar las metas antes de cada prueba para asegurar un estado limpio
  beforeEach(async () => {
    // Similar a las tareas, limpiamos las metas antes de cada test.
    // Esto es debido al almacenamiento en memoria.
    const res = await request(app).get('/goals').set('Authorization', apiKey);
    const initialGoals = res.body;
    // Verificar que initialGoals es un array antes de iterar
    if (Array.isArray(initialGoals)) {
      for (const goal of initialGoals) {
        await request(app).delete(`/goals/${goal.id}`).set('Authorization', apiKey);
      }
    }
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
    expect(res.body).toHaveProperty('id');
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
      // Crear una meta para las pruebas de GET por ID y DELETE
      const newGoalData = {
        name: 'Goal for GET and DELETE',
        description: 'Temporary goal',
        dueDate: '2025-02-01',
      };
      const postRes = await request(app).post('/goals').set('Authorization', apiKey).send(newGoalData);
      createdGoal = postRes.body;
    });

    it('GET /goals/:id - debería devolver una meta específica', async () => {
      const res = await request(app).get(`/goals/${createdGoal.id}`).set('Authorization', apiKey);
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(createdGoal.id);
      expect(res.body.name).toEqual(createdGoal.name);
    });

    it('GET /goals/:id - debería devolver 404 si la meta no existe', async () => {
      const res = await request(app).get('/goals/9999').set('Authorization', apiKey); // ID que no existe
      expect(res.statusCode).toEqual(404);
    });

    it('DELETE /goals/:id - debería eliminar una meta específica', async () => {
      const res = await request(app).delete(`/goals/${createdGoal.id}`).set('Authorization', apiKey);
      expect(res.statusCode).toEqual(204);

      // Verificar que la meta ya no existe
      const getRes = await request(app).get(`/goals/${createdGoal.id}`).set('Authorization', apiKey);
      expect(getRes.statusCode).toEqual(404);
    });

    it('DELETE /goals/:id - debería devolver 404 si la meta a eliminar no existe', async () => {
      const res = await request(app).delete('/goals/9998').set('Authorization', apiKey); // ID que no existe
      expect(res.statusCode).toEqual(404);
    });
  });
});
