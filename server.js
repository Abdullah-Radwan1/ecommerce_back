import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

// Top-level await to block execution until DB is fully alive
try {
  await connectDB();
  console.log("Database connected smoothly before server start.");
} catch (error) {
  console.error("Database connection failed completely:", error);
}

// Conditionally listen if running locally
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// CRITICAL for Vercel
export default app;
