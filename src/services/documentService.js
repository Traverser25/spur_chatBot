import { embedText } from "./embeddingService.js";
import Document from "../db/models/document.model.js"
import { l2Distance } from "pgvector/sequelize";


import { TOP_K_LIMIT } from "../config/constants.js";
import sequelize from "../db/client.js";

export async function ingestDocument(content) {
  const embedding = await embedText(content);
  
  return Document.create({
    content,
    embedding
  });
}

export async function searchDocuments(query, limit =TOP_K_LIMIT) {
  const queryEmbedding = await embedText(query);

  return Document.findAll({
    order: l2Distance("embedding", queryEmbedding, sequelize),
    limit
  });
}



export async function searchDocuments2(query, limit = TOP_K_LIMIT) {
  if (!query || typeof query !== "string") {
    throw new Error("Invalid query");
  }

  const queryEmbedding = await embedText(query);

  /* -------- VECTOR SEARCH -------- */
  const vectorResults = await Document.findAll({
    order: l2Distance("embedding", queryEmbedding, sequelize),
    limit
  });
  
  


  /* -------- TEXT SEARCH -------- */
  const textResults = await Document.findAll({
    where: sequelize.literal(
      `content_tsv @@ plainto_tsquery('english', ${sequelize.escape(query)})`
    ),
    limit
  });

  /* -------- MERGE & DEDUP -------- */
  const map = new Map();

  for (const doc of [...vectorResults, ...textResults]) {
    map.set(doc.id, doc);
  }

  return Array.from(map.values());
}


export async function searchDocuments3(query, limit = TOP_K_LIMIT) {
  if (!query || typeof query !== "string") {
    throw new Error("Invalid query");
  }

  // ----------------- Business Intent Gate -----------------
  const BUSINESS_TERMS = [
    "spur", "pricing", "plan", "billing", "account",
    "feature", "subscription", "automation", "trial", "login", "payment"
  ];

  const isBusinessIntent = query =>
    BUSINESS_TERMS.some(term => query.toLowerCase().includes(term));

  if (isBusinessIntent(query)) {
    // Hard refusal for off-topic queries
    return [];
  }

  const queryEmbedding = await embedText(query);

  // ----------------- VECTOR SEARCH -----------------
  const vectorResults = await Document.findAll({
    attributes: {
      include: [
        [l2Distance("embedding", queryEmbedding, sequelize), "distance"]
      ]
    },
    order: [[sequelize.literal("distance"), "ASC"]],
    limit
  });
  
  //console.log(vectorResults)
  // ----------------- FILTER VECTOR RESULTS BY DISTANCE -----------------
  const MAX_DISTANCE = 1.9; // tune based on embedding scale
  const filteredVectorResults = vectorResults.filter(d => d.get("distance")<= MAX_DISTANCE);

  // ----------------- TEXT SEARCH -----------------
  const textResults = await Document.findAll({
    where: sequelize.literal(
      `content_tsv @@ plainto_tsquery('english', ${sequelize.escape(query)})`
    ),
    limit
  });

//   for (const doc of filteredVectorResults) {
//   console.log(`ID: ${doc.id}`);
//   console.log(`Distance: ${doc.get("distance")}`); // distance stored in attribute
//   console.log(`Content: ${doc.content}`);
//   console.log("---------------------------");
// }

  // ----------------- MERGE & DEDUP -----------------
  const map = new Map();

  for (const doc of [...filteredVectorResults, ...textResults]) {
    map.set(doc.id, doc);
  }

  return Array.from(map.values());
}