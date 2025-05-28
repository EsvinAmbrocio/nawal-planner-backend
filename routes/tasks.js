const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - dueDate
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID autogenerado de la tarea.
 *         name:
 *           type: string
 *           description: El nombre de la tarea.
 *         description:
 *           type: string
 *           description: La descripción de la tarea.
 *         dueDate:
 *           type: string
 *           format: date
 *           description: La fecha de vencimiento de la tarea.
 *       example:
 *         id: 1
 *         name: "Comprar leche"
 *         description: "Ir al supermercado a comprar leche deslactosada."
 *         dueDate: "2025-12-01"
 *     NewTask:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - dueDate
 *       properties:
 *         name:
 *           type: string
 *           description: El nombre de la tarea.
 *         description:
 *           type: string
 *           description: La descripción de la tarea.
 *         dueDate:
 *           type: string
 *           format: date
 *           description: La fecha de vencimiento de la tarea.
 *       example:
 *         name: "Hacer ejercicio"
 *         description: "Salir a correr 30 minutos."
 *         dueDate: "2025-05-12"
 */

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: API para gestionar tareas (Requiere API Key)
 * security:
 *   - ApiKeyAuth: []
 */

// GET todas las tareas
/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Devuelve una lista de todas las tareas
 *     tags: [Tasks]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: La lista de tareas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
});

// GET una tarea por ID
/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Obtiene una tarea por su ID
 *     tags: [Tasks]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: El ID de la tarea
 *     responses:
 *       200:
 *         description: La descripción de la tarea por ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Tarea no encontrada
 */
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: 'Invalid ID', error: err.message });
  }
});

// POST crear una nueva tarea
/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Crea una nueva tarea
 *     tags: [Tasks]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewTask'
 *     responses:
 *       201:
 *         description: La tarea fue creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Faltan campos requeridos
 */
router.post('/', async (req, res) => {
  const { name, description, dueDate } = req.body;
  if (!name || !description || !dueDate) {
    return res.status(400).json({ message: 'Missing required fields: name, description, dueDate' });
  }
  try {
    const newTask = new Task({ name, description, dueDate });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: 'Error creating task', error: err.message });
  }
});

// DELETE una tarea por ID
/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Elimina una tarea por su ID
 *     tags: [Tasks]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: El ID de la tarea
 *     responses:
 *       204:
 *         description: Tarea eliminada exitosamente
 *       404:
 *         description: Tarea no encontrada
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: 'Invalid ID', error: err.message });
  }
});

module.exports = router;
