import { Sequelize } from "sequelize";
import pgvector from "pgvector/sequelize";
import dotenv from "dotenv";

// IMPORTANT: import models BEFORE sync
// import "./models/chatMessage_model.js";
// import "./models/other_model.js";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: false,
});

pgvector.registerTypes(Sequelize);

async function initDatabase() {
  try {
    await sequelize.authenticate();

    // required for pgvector
    await sequelize.query("CREATE EXTENSION IF NOT EXISTS vector");

    // create tables (dev-safe)
    await sequelize.sync();

    console.log("Database initialized");
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }
}

// top-level await is OK in ESM
//await initDatabase();

export default sequelize;
