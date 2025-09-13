require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const admin = require("firebase-admin");
const fs = require("fs");

const app = express();

// 🔹 Middleware
app.use(cors({ origin: "*" })); // You can restrict to Webflow domain if needed
app.use(express.json());

// 🔹 Firebase Admin SDK
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || "./serviceAccountKey.json";

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Firebase service account key not found!");
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 🔹 MongoDB connection
const mongoURI = process.env.MONGODB_URI || "YOUR_MONGODB_ATLAS_URL";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// 🔹 Item Schema & Model
const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
  description: String,
  userId: { type: String, required: true }, // Link item to Firebase user
}, { timestamps: true });

const Item = mongoose.model("Item", ItemSchema);

// 🔹 Middleware to verify Firebase ID token
const authenticateFirebase = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // uid, email, etc.
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// 🔹 Routes
// Add new item (protected)
app.post("/add", authenticateFirebase, async (req, res, next) => {
  try {
    const newItem = new Item({ ...req.body, userId: req.user.uid });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    next(err);
  }
});

// Get all items for this user (protected)
app.get("/items", authenticateFirebase, async (req, res, next) => {
  try {
    const items = await Item.find({ userId: req.user.uid }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// Optional: Get all items (admin)
app.get("/admin/items", authenticateFirebase, async (req, res, next) => {
  try {
    // Example: only allow admin by UID (replace with your UID)
    if (req.user.uid !== process.env.ADMIN_UID) {
      return res.status(403).json({ error: "Access denied" });
    }
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// 🔹 Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: err.message });
});

// 🔹 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
