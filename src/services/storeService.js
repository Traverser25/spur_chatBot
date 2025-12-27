import ChatMessage from "../db/models/chatMessage_model.js";

/**
 * Save a single chat message to DB
 * @param {string} sessionId
 * @param {"user"|"assistant"} role
 * @param {string} content
 * 
 */




export async function saveMessage(sessionId, role, content) {
  try {
    return await ChatMessage.create({ sessionId, role, content });
  } catch (err) {
    console.error("Failed to save message:", err.message);
    throw err;
  }
}

/**
 * Save multiple messages in bulk
 * @param {Array<{sessionId:string, role:"user"|"assistant", content:string}>} messages
 */

export async function saveMessages(messages) {
  if (!messages || messages.length === 0) return;
  try {
    return await ChatMessage.bulkCreate(messages);
  } catch (err) {
    console.error("Failed to save messages:", err.message);
    throw err;
  }
}

/**
 * Retrieve chat history for a session
 * @param {string} sessionId
 * @param {number} limit - number of messages to retrieve (optional)
 * @returns {Array<{role:string, content:string, createdAt:Date}>}
 */

///to do add time  column  ...




const MAX_HISTORY = 100;
const PAGE_SIZE = 20;

/**
 * Fetch chat history safely (body-based pagination)
 */
export async function getChatHistory(sessionId, offset = 0, limit = PAGE_SIZE) {
  try {
    if (!sessionId) {
      throw new Error("sessionId is required");
    }

    console.log("received session id:", sessionId);

    const safeLimit = Math.min(limit, PAGE_SIZE);
    const safeOffset = Math.max(offset, 0);

    // Step 1: fetch only last MAX_HISTORY messages
    const rows = await ChatMessage.findAll({
      where: { sessionId },
      order: [
        ["created_at", "DESC"],
        ["id", "DESC"]
      ],
      limit: MAX_HISTORY
    });

    if (!rows.length) {
      return { messages: [], hasMore: false, total: 0 };
    }

    // Step 2: paginate in memory
    const total = rows.length;
    const start = safeOffset;
    const end = safeOffset + safeLimit;

    if (start >= total) {
      return { messages: [], hasMore: false, total };
    }

    const page = rows.slice(start, end);

    return {
      messages: page
        .reverse()
        .map((m) => ({
          role: m.role,
          content: m.content,
          createdAt: m.created_at // match DB column
        })),
      hasMore: end < total,
      total
    };

  } catch (err) {
    console.error("Failed to fetch chat history:", err.message);
    throw err;
  }
}


/**
 * Get the latest assistant message for a session
 * @param {string} sessionId
 * @returns {Promise<{role:string, content:string, createdAt:Date} | null>}
 */
export async function getLatestAssistantMessage(sessionId) {
  if (!sessionId) throw new Error("sessionId is required");

  try {
    const [latestMsg] = await ChatMessage.findAll({
      where: { sessionId, role: "assistant" },
      order: [["id", "DESC"]],
      limit: 1
    });

    if (!latestMsg) return null;

    return {
      role: latestMsg.role,
      content: latestMsg.content,
      createdAt: latestMsg.created_at
    };
  } catch (err) {
    console.error("Failed to fetch latest assistant message:", err.message);
    throw err;
  }
}