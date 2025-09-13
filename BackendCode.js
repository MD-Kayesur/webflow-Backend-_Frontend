

[
  {
    "name": "Product A",
    "value": "$25",
    "description": "High quality product A"
  },
  {
    "name": "Product B",
    "value": "$40",
    "description": "Best seller product B"
  },
  {
    "name": "Product C",
    "value": "$15",
    "description": "Affordable product C"
  }
]





// npm init -y
// npm install express mongoose cors
// node server.js










const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 MongoDB connection (আপনার MongoDB Atlas URI বসান)
mongoose.connect("YOUR_MONGODB_ATLAS_URL", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 🔹 Schema & Model
const ItemSchema = new mongoose.Schema({
  name: String,
  value: String,
  description: String,
});
const Item = mongoose.model("Item", ItemSchema);

// 🔹 Routes
// Add new item
app.post("/item", async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get all items
app.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// add all user
app.post("/user", async (req, res) => {
  try {
    const { userId, name, value, description } = req.body;
    const newItem = new Item({ userId, name, value, description });
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get spicific user
app.get("/items/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await Item.find({ userId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
