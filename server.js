const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const app = express();
const port = 3000;

// Middleware to parse JSON and allow CORS
app.use(express.json());
app.use(cors());

// MongoDB connection string (replace with your actual connection string)
const uri = "mongodb+srv://<tayubdar>:<BonzoADA90*>@cluster0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
connectToDatabase();

// Route to submit attendance
app.post("/submit-attendance", async (req, res) => {
  const { department, name, role, initials, shift, date } = req.body;

  try {
    const database = client.db("aocc-attendance");
    const collection = database.collection("attendance");

    // Insert the new entry into the database
    await collection.insertOne({ department, name, role, initials, shift, date });

    res.send("Attendance submitted successfully!");
  } catch (error) {
    console.error("Error submitting attendance:", error);
    res.status(500).send("Error submitting attendance");
  }
});

// Route to fetch all attendance data
app.get("/get-attendance", async (req, res) => {
  try {
    const database = client.db("aocc-attendance");
    const collection = database.collection("attendance");

    // Fetch all entries from the database
    const attendanceData = await collection.find({}).toArray();

    res.json(attendanceData);
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    res.status(500).send("Error fetching attendance data");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});