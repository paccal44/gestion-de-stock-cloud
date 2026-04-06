require("dotenv").config();

const mongoose = require("mongoose");

async function connectDatabase(serviceName) {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/gestion_stock_tp";

  try {
    await mongoose.connect(mongoUri);
    console.log(`${serviceName} connected to MongoDB`);
  } catch (error) {
    console.error(`${serviceName} failed to connect to MongoDB`, error.message);
    process.exit(1);
  }
}

module.exports = {
  connectDatabase
};
