const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/analyticsDB';

mongoose.connect(MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Connection error:', err);
  process.exit(1);
});

const measurementSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  field1: { type: Number, required: true },
  field2: { type: Number, required: true },
  field3: { type: Number, required: true }
});

const Measurement = mongoose.model('Measurement', measurementSchema);

const generateSampleData = () => {
  const data = [];
  const startDate = new Date('2025-01-01');
  
  for (let i = 0; i < 100; i++) {
    const timestamp = new Date(startDate.getTime() + i * 3600000);
    data.push({
      timestamp: timestamp,
      field1: parseFloat((20 + Math.random() * 10).toFixed(2)),
      field2: parseFloat((60 + Math.random() * 20).toFixed(2)),
      field3: parseFloat((400 + Math.random() * 100).toFixed(2))
    });
  }
  
  return data;
};

const seedDatabase = async () => {
  try {
    await Measurement.deleteMany({});
    console.log('Cleared existing data');
    
    const sampleData = generateSampleData();
    await Measurement.insertMany(sampleData);
    console.log(`Inserted ${sampleData.length} sample records`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();