import "dotenv/config";

import express from "express";
import cors from "cors";

import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import {
  resume,
  selfDescription,
  jobDescription,
} from "./src/services/temp.js";

connectDB();

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
