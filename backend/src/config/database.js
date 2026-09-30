import mongoose from "mongoose";

let mongodInstance = null;

const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log("No MONGO_URI provided in environment. Starting in-memory MongoDB server...");
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const fs = await import("fs");
      const dbPath = process.env.MONGOMS_DBPATH || "D:\\mongodb-data";
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }
      mongodInstance = await MongoMemoryServer.create({
        downloadDir: process.env.MONGOMS_DOWNLOAD_DIR || "D:\\mongodb-binaries",
        instance: {
          dbPath,
        },
      });
      mongoUri = mongodInstance.getUri();
      console.log(`In-memory MongoDB started at: ${mongoUri}`);
    } catch (memErr) {
      console.error("Failed to start in-memory MongoDB server:", memErr);
      process.exit(1);
    }
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;