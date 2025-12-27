// server.js
import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";

import sequelize from "./db/client.js";
import { registerModels } from "./db/models/index.js";

const server = express();

// ---------- middleware ----------
server.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
server.use(express.json());

// ---------- routes ----------
server.use("/api/chat", chatRoutes);
server.get("/", (req, res) => res.send("Server is running"));

// ---------- DB init ----------
async function initDB() {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    // Register models BEFORE sync
    registerModels();

    // Safe for production (no data loss)
    await sequelize.sync({ alter: true });

    console.log("Models synced (tables, columns, indexes ensured)");
  } catch (err) {
    console.error("DB init failed:", err);
    process.exit(1);
  }
}

// ---------- start server ----------
initDB().then(() => {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
