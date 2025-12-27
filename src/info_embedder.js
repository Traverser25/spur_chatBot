import fs from "fs";
import path from "path";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ingestDocument } from "./services/documentService.js";

// Read file
// const filePath = "C:\\Users\\HP\\Desktop\\spur_final\\src\\spur_know.txt";
my_file="spur_know.txt"
const filePath = path.join(process.cwd(), "src", my_file);
const spurText = fs.readFileSync(filePath, "utf-8");

async function run() {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,        // good balance
    chunkOverlap: 150,     // keeps context continuity
    separators: ["\n\n", "\n", ". ", " ", ""]
  });

  const chunks = await splitter.splitText(spurText);

  for (const chunk of chunks) {
    await ingestDocument(chunk);
  }

  console.log(`Ingested ${chunks.length} chunks`);
}

run().catch(console.error);
