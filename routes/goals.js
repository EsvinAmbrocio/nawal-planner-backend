const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');

/**
 * @swagger
 * components:
 *   schemas:
 *     Goal:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - dueDate
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID autogenerado de la meta.
 *         name:
 *           type: string
 *           description: El nombre de la meta.
 *         description:
 *           type: string
 *           description: La descripción de la meta.
 *         dueDate:
 *           type: string
 *           format: date
 *           description: La fecha de vencimiento de la meta.
 *       example:
 *         id: 1
 *         name: "Aprender Node.js"
 *         description: "Completar un curso en línea."
 *         dueDate: "2025-08-01"
 *     NewGoal:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - dueDate
 *       properties:
 *         name:
 *           type: string
 *           description: El nombre de la meta.
 *         description:
 *           type: string
 *           description: La descripción de la meta.
 *         dueDate:
 *           type: string
 *           format: date
 *           description: La fecha de vencimiento de la meta.
 *       example:
 *         name: "Correr una maratón"
 *         description: "Entrenar 5 días a la semana."
 *         dueDate: "2026-03-15"
 */

/**
 * @swagger
 * tags:
 *   name: Goals
 *   description: API para gestionar metas (Requiere API Key)
 * security:
 *   - ApiKeyAuth: []
 */

// GET todas las metas
/**
 * @swagger
 * /goals:
 *   get:
 *     summary: Devuelve una lista de todas las metas
 *     tags: [Goals]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: La lista de metas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Goal'
 */
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find();
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching goals', error: err.message });
  }
});

// GET una meta por ID
/**
 * @swagger
 * /goals/{id}:
 *   get:
 *     summary: Obtiene una meta por su ID
 *     tags: [Goals]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: El ID de la meta
 *     responses:
 *       200:
 *         description: La descripción de la meta por ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Goal'
 *       404:
 *         description: Meta no encontrada
 */
router.get('/:id', async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json(goal);
  } catch (err) {
    res.status(400).json({ message: 'Invalid ID', error: err.message });
  }
});

// POST crear una nueva meta
/**
 * @swagger
 * /goals:
 *   post:
 *     summary: Crea una nueva meta
 *     tags: [Goals]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewGoal'
 *     responses:
 *       201:
 *         description: La meta fue creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Goal'
 *       400:
 *         description: Faltan campos requeridos
 */
router.post('/', async (req, res) => {
  const { name, description, dueDate } = req.body;
  if (!name || !description || !dueDate) {
    return res.status(400).json({ message: 'Missing required fields: name, description, dueDate' });
  }
  try {
    const newGoal = new Goal({ name, description, dueDate });
    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (err) {
    res.status(500).json({ message: 'Error creating goal', error: err.message });
  }
});

// DELETE una meta por ID
/**
 * @swagger
 * /goals/{id}:
 *   delete:
 *     summary: Elimina una meta por su ID
 *     tags: [Goals]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: El ID de la meta
 *     responses:
 *       204:
 *         description: Meta eliminada exitosamente
 *       404:
 *         description: Meta no encontrada
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Goal.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: 'Invalid ID', error: err.message });
  }
});

module.exports = router;
