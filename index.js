const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 3000;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/analyticsDB';

mongoose.connect(MONGODB_URI).then(() => {
  console.log('Connected to MongoDB successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const measurementSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  field1: { type: Number, required: true },
  field2: { type: Number, required: true },
  field3: { type: Number, required: true }
});

const Measurement = mongoose.model('Measurement', measurementSchema);

app.use(express.json());
app.use(express.static('public'));

app.get('/api/measurements', async (req, res) => {
  try {
    const { field, start_date, end_date } = req.query;

    if (!field || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required parameters: field, start_date, end_date' });
    }

    if (!['field1', 'field2', 'field3'].includes(field)) {
      return res.status(400).json({ error: 'Invalid field name. Must be field1, field2, or field3' });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const measurements = await Measurement.find({
      timestamp: { $gte: startDate, $lte: endDate }
    }).select(`timestamp ${field}`).sort({ timestamp: 1 });

    if (measurements.length === 0) {
      return res.status(404).json({ error: 'No data found in the specified range' });
    }

    const result = measurements.map(m => ({
      timestamp: m.timestamp,
      [field]: m[field]
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

app.get('/api/measurements/metrics', async (req, res) => {
  try {
    const { field, start_date, end_date } = req.query;

    if (!field) {
      return res.status(400).json({ error: 'Missing required parameter: field' });
    }

    if (!['field1', 'field2', 'field3'].includes(field)) {
      return res.status(400).json({ error: 'Invalid field name. Must be field1, field2, or field3' });
    }

    let query = {};
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }

      query.timestamp = { $gte: startDate, $lte: endDate };
    }

    const measurements = await Measurement.find(query).select(field);

    if (measurements.length === 0) {
      return res.status(404).json({ error: 'No data found' });
    }

    const values = measurements.map(m => m[field]);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    res.json({
      avg: parseFloat(avg.toFixed(2)),
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      stdDev: parseFloat(stdDev.toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});