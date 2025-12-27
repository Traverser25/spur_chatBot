import express from "express";
import { chatWithSession } from "../services/chatService.js";
import { getChatHistory } from "../services/storeService.js";

const router = express.Router();

const MAX_QUERY_LENGTH = 1000;

/**
 * POST /chat
 * Send a chat message
 */
router.post("/", async (req, res) => {
  try {
    const { query, sessionId } = req.body;

    if (!query || !sessionId) {
      return res.status(400).json({
        status: 400,
        data: { reply: null, createdAt: null },
        message: "query and sessionId are required"
      });
    }

    // gentle length guard
    if (query.length > MAX_QUERY_LENGTH) {
      return res.status(200).json({
        status: 200,
        data: {
          reply:
            "That message is a bit long 🙂 Could you please shorten it or split it into smaller parts? I’ll be happy to help.",
          createdAt: new Date().toISOString()
        },
        message: "Message too long"
      });
    }

    // -------- Call chat service --------
    const replyObj = await chatWithSession(sessionId, query); // { reply, createdAt }

    return res.status(200).json({
      status: 200,
      data: replyObj, // <-- already has reply + createdAt
      message: "Chat processed successfully"
    });

  } catch (err) {
    console.error("Chat error:", err.message);
    return res.status(500).json({
      status: 500,
      data: { reply: null, createdAt: null },
      message: "Chat failed"
    });
  }
});
/**
 * POST /chat/history
 * Body-based pagination for chat history
 */
router.post("/history", async (req, res) => {
  try {
    const { sessionId, offset = 0, limit = 10 } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "sessionId is required"
      });
    }

    const result = await getChatHistory(sessionId, offset, limit);

    return res.status(200).json({
      status: 200,
      data: result,
      message: "Chat history fetched successfully"
    });

  } catch (err) {
    console.error("Chat history error:", err.message);
    return res.status(500).json({
      status: 500,
      data: null,
      message: "Failed to fetch chat history"
    });
  }
});

export default router;
