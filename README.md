# 🤖 Spur AI Chatbot

## 📌 Overview

Spur AI Chatbot is a **minimal, self-hosted, AI-based customer support chatbot** built using Retrieval Augmented Generation (RAG).

The system is designed to answer **customer support and product-related queries** accurately using **only business-provided knowledge**, keeping responses controlled, reliable, and cost-efficient.

This project focuses on:
- Low operational cost
- Full data ownership
- Minimal third-party dependency
- Simple deployment on AWS infrastructure

You can plug in your business content, run the ingestion process, and deploy the chatbot with minimal setup.

---

## Core Goals

- Build a practical customer support chatbot
- Avoid expensive third-party services
- Keep all data inside your own infrastructure
- Maintain accuracy using context-bound AI responses
- Keep the system simple and production-ready

---

## Architecture Overview



![Spur AI Chatbot Architecture](./Screenshot202025-12-2820111122.png)

The chatbot follows a **Retrieval Augmented Generation (RAG)** approach:

1. User sends a query from the frontend
2. Backend generates an embedding for the query
3. Relevant business documents are retrieved from PostgreSQL
4. Retrieved context is injected into the LLM prompt
5. LLM generates a response strictly based on provided context
6. Reply is returned to the frontend

No conversation state is stored inside the LLM.

---


## Frontend
### Frontend code: https://github.com/Traverser25/spur_frontend

- The frontend is a simplified copy of the Spur landing page with react 
- A small chat widget appears via a floating chat button  
- Chat UI is inspired by WhatsApp-style messaging  
- Supports session-based conversations  
- Previous chat history is preserved per session  
- Allows starting a new chat session  
- Smooth scrolling for long conversations  
- Each message includes a timestamp  
- Designed to be minimal and lightweight for easy integration  


## Technology Stack & Justification

### Backend — Node.js + Express

**Why Node.js**
- Non-blocking I/O suits API-based workloads
- Strong ecosystem for databases and AI tooling
- Easy to scale and deploy on cloud infrastructure

**Why Express**
- Minimal and unopinionated
- Full control over middleware and request flow
- Easy to debug and maintain

---

### Database — PostgreSQL

PostgreSQL is used as the **single source of truth**.

**Why PostgreSQL**
- Stable, mature, and production-proven
- Supports structured data, text search, and vector search
- Removes the need for multiple databases

---

### Vector Search — pgvector

**Why pgvector**
- Runs natively inside PostgreSQL
- No separate vector database required
- Supports HNSW indexes for fast similarity search
- Simplifies backups, migrations, and operations

This keeps the system **self-hosted and cost-efficient**.

---

### Hybrid Search (Vector + Text)

The chatbot uses **both semantic and keyword-based search**.

- Vector search handles meaning and intent
- Text search handles exact terms, names, and pricing

**Why Hybrid Search**
- Better accuracy than vector-only search
- Handles edge cases and proper nouns
- Reduces hallucinations

---

### Embeddings — Local Model (Xenova)

**Why Local Embeddings**
- Zero per-request cost
- No dependency on external embedding APIs
- Full control over data flow

Local embeddings are accurate enough for customer support use cases while keeping costs low.

---

### LLM — Groq API (LLaMA Model)

**Why Groq**
- Free API tier available
- Fast inference speed
- High-quality responses for support-style queries

The LLM is used **only for response generation**, not storage or retrieval.

---

### Frontend — Lightweight Chat UI (React )

**Why a Lightweight Frontend, I copied from  spur  landing  page**
- Simple chat-style interface
- Minimal client-side logic
- Session-based communication

The frontend only handles message input, display, and session ID generation.

---

### Session Handling

- Session ID is generated on the frontend
- Each request includes the session ID
- Backend groups chat history by session

**Why Session-Based Design**
- No authentication required
- Easy multi-user isolation
- Ready for Redis-based scaling in the future

---

### Hosting — AWS (EC2 + Nginx)

**Why AWS**
- Full infrastructure control
- Predictable and manageable costs
- Easy to scale when needed

**Why Nginx**
- Reverse proxy for backend APIs
- Serves static frontend files
- Handles routing and basic security

---

## Security Considerations

- Session-based isolation
- Query length validation
- Backend-level rate limiting
- No direct database exposure
- LLM responses strictly limited to provided context

---

## Summary for  design 

This project prioritizes:
- Ownership over convenience
- Simplicity over complexity
- Cost efficiency over managed services

Spur AI Chatbot is designed as a **clean, understandable RAG system** that can be extended without architectural lock-in.


## Context Handling & Prompt Design

### Prompt Management

The system prompt is defined centrally inside `constants.js`.  
Keeping the prompt in a single place ensures consistency, easier updates, and better control over LLM behavior.

The prompt is written in a **strict, instruction-driven style** to:
- Reduce prompt injection risks
- Prevent instruction override
- Ensure responses stay within business context
- Avoid hallucinations

The LLM is explicitly instructed to:
- Answer only using the provided context
- Decline questions outside customer support scope
- Keep responses concise and factual

---

### Context Construction

For every user query, the backend constructs context in three layers:

1. **Retrieved Knowledge Context**
   - Relevant documents are fetched from PostgreSQL using hybrid search (vector + text).
   - Only the most relevant chunks are selected to keep token usage low.

2. **Conversation History**
   - The last **10 user–assistant messages** are included.
   - This preserves short-term conversational continuity without bloating the prompt.

3. **User Query**
   - The latest user message is appended at the end to ensure priority.

This layered approach ensures accuracy while maintaining performance




## Security Measures

### Prompt Injection Mitigation

- Hard system prompt rules
- No dynamic system prompt mutation
- User input is never merged into system instructions
- Retrieved context is treated as read-only reference data

---

### Rate Limiting

- Implemented at the API level
- IP-based rate limiting
- No Redis dependency at this stage

This keeps the system lightweight and easy to deploy while still providing basic abuse protection.

---

## Service-Oriented Backend Design

The backend is structured using **separate services for each responsibility**, following the principle:

> One service should not change another service’s behavior.

Examples:
- Retrieval service
- Embedding service
- LLM response service
- Session management service

This separation ensures:
- Easier debugging
- Independent upgrades
- Clear responsibility boundaries
- Long-term maintainability

---

## Minimal NLP & Intent Handling

Currently, the bot intentionally **does not include heavy NLP or intent classification**.

**Reasoning:**
- Faster deployment
- Lower complexity
- Easier testing and iteration
- Fewer moving parts in early stages

The system relies on:
- Retrieval relevance
- Prompt discipline
- Controlled response generation

This keeps the chatbot **production-usable yet minimal**.

---

## Installation & Setup

Follow these steps to set up the Spur AI Chatbot locally or on a server.

---

### 1. Prerequisites

Make sure you have the following installed:

- Node.js (v18 or later)
- PostgreSQL (v15+ recommended)
- pgvector extension enabled
- npm or yarn

---

### 2. Install PostgreSQL & pgvector

If PostgreSQL is already installed, you can skip this step.

Enable the pgvector extension in your database:

CREATE EXTENSION IF NOT EXISTS vector;

This makes vector search available inside PostgreSQL.

---

### 3. Environment Configuration

Create a `.env` file in the project root and add the following:

DATABASE_URL=postgres://user:password@localhost:5432/spur_ai
GROQ_API_KEY=your_groq_api_key_here
PORT=3000

If PostgreSQL is already running elsewhere, just update the connection string.

---

### 4. Install Dependencies

From the main project directory, run:

npm install

This will install all backend dependencies.

---

### 5. Initialize Database

Once dependencies are installed, start the server once:

npm run dev

On first run, the project will automatically create the required
PostgreSQL tables and indexes (including vector indexes).

You can stop the server after this step.

---

### 6. Prepare Business Knowledge

Create a plain text file containing your business information, FAQs,
product details, pricing, and support content.

Example:
knowledge.txt

This file will be used to generate embeddings.

---

### 7. Embed Knowledge into Database

Run the embedding script:

node info_embeder.js

Before running:
- Make sure the path to your knowledge file is correctly set inside
  `info_embed.js`
- The script will automatically:
  - Chunk the text
  - Generate embeddings using a local model (Xenova)
  - Store vectors and text in PostgreSQL

This step only needs to be done when knowledge changes.

---

### 8. Start the API Server

Start the backend server:

npm run dev

The chatbot API will now be available.

---

### 9. Test the Chat API

Endpoint:
POST /api/chat

Request body:
{
  "sessionId": "your-session-id",
  "query": "What does Spur do?"
}

The API will return a context-aware response based on your knowledge base.

---

### Notes

- No paid embedding APIs are used
- pgvector runs inside PostgreSQL
- Redis is not required for initial setup
- Designed for easy deployment on AWS EC2 or RDS





 
## Future Improvements(if  more time was avaialable)

- Use Redis for session storage, caching, and rate limiting  
- Add basic NLP checks to filter invalid or malicious queries  
- Perform an LLM rewrite step before embedding for better retrieval  
- Add reranking on retrieved documents to improve answer accuracy  
- Support multiple business knowledge files with metadata  
- Improve database structure and embedding versioning  
- Smarter context selection instead of fixed message count  
- Support multiple LLM providers with fallback logic  

