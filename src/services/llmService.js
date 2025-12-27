//import OpenAI from "openai";
import axios from "axios";
import { SYSTEM_PROMPT, DEFAULT_USER_PROMPT } from "../config/prompt.js";
import dotenv from "dotenv";
dotenv.config();


// Initialize OpenAI client
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// Initialize Groq axios instance
// const GROQ_API_KEY = process.env.GROK_API_KEY;

// console.log("here is the key",GROQ_API_KEY)
// const groq = axios.create({
//   baseURL: "https://api.groq.com/openai/v1/chat",
//   headers: {
//     "Authorization": `Bearer ${GROQ_API_KEY}`,
//     "Content-Type": "application/json"
//   }
// });

/**
 * Generate reply using OpenAI
 */
// export async function generateOpenAIReply(userMessage, context = "") {
//   try {
//     const prompt = `${SYSTEM_PROMPT}\nContext: ${context}\n${DEFAULT_USER_PROMPT(userMessage)}`;

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: SYSTEM_PROMPT },
//         { role: "user", content: prompt }
//       ],
//       temperature: 0.2,
//       max_tokens: 500
//     });

//     return response.choices[0].message.content.trim();
//   } catch (err) {
//     console.error("OpenAI LLM error:", err.message);
//     return "Sorry, I couldn't generate a response at the moment.";
//   }
// }

/**
 * Generate reply using Groq
 */

// const GROQ_API_KEY = process.env.GROK_API_KEY;

// // console.log("here is the key",GROQ_API_KEY)
// const groq = axios.create({
//   baseURL: "https://api.groq.com/openai/v1/chat",
//   headers: {
//     "Authorization": `Bearer ${GROQ_API_KEY}`,
//     "Content-Type": "application/json"
//   }
// });



// export async function generateGroqReply2(
//   messages,
//   model = "llama-3.3-70b-versatile"
// ) {
//   try {
//     if (!Array.isArray(messages) || messages.length === 0) {
//       throw new Error("Messages must be a non-empty array");
//     }

//     const response = await groq.post("/completions", {
//       model,
//       messages,
//       temperature: 0
//     });

//     return response.data.choices[0].message.content.trim();
//   } catch (err) {
//     console.error("Groq LLM error:", err.response?.data || err.message);
//     return "Sorry, I couldn't generate a response at the moment.";
//   }
// }



const GROQ_API_KEY = process.env.GROK_API_KEY;

const groq = axios.create({
  baseURL: "https://api.groq.com/openai/v1/chat",
  headers: {
    Authorization: `Bearer ${GROQ_API_KEY}`,
    "Content-Type": "application/json"
  },
  timeout: 15_000 // ⏱ protect server
});

// ---------- Config ----------
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

// ---------- Utils ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isRetryable(err) {
  const status = err?.response?.status;
  return status === 429 || status >= 500;
}

function log(level, message, meta = {}) {
  console[level](
    JSON.stringify({
      level,
      message,
      ...meta,
      timestamp: new Date().toISOString()
    })
  );
}

// ---------- Main ----------
export async function generateGroqReply2(
  messages,
  model = "llama-3.3-70b-versatile"
) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Messages must be a non-empty array");
  }

  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    try {
      log("info", "Groq request started", {
        attempt,
        model,
        messageCount: messages.length
      });

      const response = await groq.post("/completions", {
        model,
        messages,
        temperature: 0
      });

      const reply = response?.data?.choices?.[0]?.message?.content;

      if (!reply) {
        throw new Error("Empty response from Groq");
      }

      log("info", "Groq request success", { attempt });
      return reply.trim();
    } catch (err) {
      const status = err?.response?.status;
      const retryable = isRetryable(err);

      log(
        retryable ? "warn" : "error",
        "Groq request failed",
        {
          attempt,
          status,
          retryable,
          error: err.response?.data || err.message
        }
      );

      if (!retryable || attempt === MAX_RETRIES) {
        break;
      }

     
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      await sleep(delay);

      attempt++;
    }
  }

  return "Sorry, I couldn't generate a response at the moment.";
}