// server.js
import express from "express";
import chatRoutes from "./routes/chatRoutes.js"; // path to your router

import sequelize from "../src/db/client.js";
//import "../src/db/models/chatMessage_model.js";

// async function create() {
//   try {
//     await sequelize.authenticate();
//     await sequelize.sync({ force: true });
//     console.log("chat_messages table created");
   
//   } catch (err) {
//     console.error(err);
  
//   }
// }
//add crated  add filed and indexes before ... 


const server = express();
import cors from "cors";

import { ipRateLimiter } from "./middlewares/rateLimiter.js";
server.set("trust proxy", true);

server.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Middleware
server.use(express.json());

// Mount chat routes
server.use("/api/chat", chatRoutes);

// Root test endpoint
server.get("/",ipRateLimiter, (req, res) => {
  res.send("Server is running!");
});

// create();
// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
