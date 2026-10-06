const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI environment variable is missing in .env!");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

module.exports = connectDB;
