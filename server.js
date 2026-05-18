// src/config/db.js

import mongoose from "mongoose";

// const MONGO_URI = process.env.MONGO_URI;

// if (!MONGO_URI) {
//   throw new Error("Please define MONGO_URI");
// }

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(
      "mongodb+srv://beedo:gpjHmCISncCE6yDX@cluster0.fbktsp7.mongodb.net/?appName=Cluster0",
      {
        bufferCommands: false,
      },
    );
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connected");
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};
