const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: String, required: true },
}, { timestamps: true });

const Goal = mongoose.models.Goal || mongoose.model('Goal', goalSchema);

module.exports = Goal;
