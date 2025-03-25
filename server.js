require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 4000; // Changed default port
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
const client = new MongoClient(MONGODB_URI); // Removed deprecated options

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('aocc-attendance');
    const collection = db.collection('attendance');

    // Routes
    app.post('/submit-attendance', async (req, res) => {
      try {
        await collection.insertOne({
          ...req.body,
          timestamp: new Date()
        });
        res.send('Attendance submitted!');
      } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
      }
    });

    app.get('/get-attendance', async (req, res) => {
      try {
        const data = await collection.find().sort({ timestamp: -1 }).toArray();
        res.json(data);
      } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
      }
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } finally {
    // Ensures the client will close when you finish/error
    process.on('SIGINT', () => client.close());
  }
}

run().catch(console.dir);