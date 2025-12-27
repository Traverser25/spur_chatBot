import { SYSTEM_PROMPT } from "../config/prompt.js";
import { searchDocuments3 } from "./documentService.js";
import { generateGroqReply2 } from "./llmService.js";
import { saveMessages,getLatestAssistantMessage } from "./storeService.js";


const TOP_K = 5;
const MAX_HISTORY = 10;

const sessionHistories = new Map();

export async function chatWithSession(sessionId, query) {
  try {
    if (!sessionHistories.has(sessionId)) {
      sessionHistories.set(sessionId, []);
    }

    let chatHistory = sessionHistories.get(sessionId);

    console.log("HERE IS session id:", sessionId);

    // -------- RAG retrieval --------
    const documents = await searchDocuments3(query, TOP_K);

    // If no documents found, return a default reply with timestamp
    if (!documents || documents.length === 0) {
      const createdAt = new Date().toISOString();
      return {
        reply: "I can help only with Spur business questions.",
        createdAt
      };
    }

    const context = documents
      .map((doc, i) => `(${i + 1}) ${doc.content}`)
      .join("\n\n");

    // -------- Build LLM messages --------
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...chatHistory,
      { role: "user", content: `Context:\n${context}\n\nQuestion:\n${query}` }
    ];

    // -------- Call LLM --------
    const replyText = await generateGroqReply2(messages);

    // -------- Update in-memory session history --------
    chatHistory.push({ role: "user", content: query });
    chatHistory.push({ role: "assistant", content: replyText });

    if (chatHistory.length > MAX_HISTORY) {
      chatHistory = chatHistory.slice(-MAX_HISTORY);
    }

    sessionHistories.set(sessionId, chatHistory);

    // -------- Persist to DB --------
    await saveMessages([
      { sessionId, role: "user", content: query },
      { sessionId, role: "assistant", content: replyText }
    ]);

    // -------- Get DB timestamp for assistant message --------

    

 const latestAssistant = await getLatestAssistantMessage(sessionId);

// return { reply: reply, createdAt: latestAssistant?.createdAt };
    return {
      reply: replyText,
      createdAt: latestAssistant
        ? latestAssistant.createdAt
        : new Date().toISOString()
    };

  } catch (err) {
    console.error("Chat Service Error:", err.message);
    return {
      reply: "Sorry, I couldn't process your request right now.",
      createdAt: new Date().toISOString()
    };
  }
}
