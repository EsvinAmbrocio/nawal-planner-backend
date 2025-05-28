const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: String, required: true },
}, { timestamps: true });

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

module.exports = Task;
