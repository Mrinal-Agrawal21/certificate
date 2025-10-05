const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'serial'
  year: { type: Number, required: true },
  seq: { type: Number, required: true, default: 0 }
});

CounterSchema.index({ name: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Counter', CounterSchema);
