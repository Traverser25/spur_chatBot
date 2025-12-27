// import axios from "axios";

// // ---------------- API Endpoints ----------------
// const CHAT_URL = "http://localhost:3000/api/chat";
// const HISTORY_URL = "http://localhost:3000/api/chat/history";

// // ---------------- Test Session ----------------
// const sessionId = "6a660f74-cafe-4940-968f-3bc6e6f73ca6";

// // ---------------- Focused Questions ----------------
// const questions = [

//   "What is the refund policy?"
// ];

// // ---------------- Send Chats ----------------
// async function sendChats() {
//   console.log("\n=== Sending chat messages ===\n");

//   for (const question of questions) {
//     try {
//       const res = await axios.post(CHAT_URL, {
//         query: question,
//         sessionId
//       });

//       console.log("User:", question);
//       console.log("Full Response:", res.data, "\n");

//     } catch (err) {
//       console.error("Error sending chat:", err.response?.data || err.message);
//     }
//   }
// }

// // ---------------- Fetch History ----------------
// async function fetchHistory(offset = 0, limit = 5) {
//   console.log(`\n=== Fetching chat history (offset=${offset}, limit=${limit}) ===\n`);

//   try {
//     const res = await axios.post(HISTORY_URL, {
//       sessionId,
//       offset,
//       limit
//     });

//     console.log("Full History Response:");
//     console.log("Status:", res.data.status);
//     console.log("Message:", res.data.message);
//     console.log("Total messages:", res.data.data.total || res.data.data.messages.length);

//     // Print each message fully
//     res.data.data.messages.forEach((msg, i) => {
//       console.log(`${i + 1}. [${msg.role}] ${msg.content} (createdAt: ${msg.createdAt})`);
//     });

//     console.log("Has more:", res.data.data.hasMore, "\n");

//   } catch (err) {
//     console.error("Error fetching history:", err.response?.data || err.message);
//   }
// }

// // ---------------- Run Test ----------------
// async function runTest() {
//   try {
//     // 1️⃣ Send chats
//     await sendChats();

//     // 2️⃣ Fetch latest messages
//     await fetchHistory(0, 5);

//   } catch (err) {
//     console.error("Test failed:", err.response?.data || err.message);
//   }
// }

// runTest();


// import axios from "axios";

// const URL = "http://localhost:3000/";
// // OR: http://localhost:3000/ (if testing locally)

// async function testRateLimit() {
//   for (let i = 1; i <= 70; i++) {
//     try {
//       const res = await axios.get(URL);
//       console.log(`Request ${i}:`, res.status, res.data);
//     } catch (err) {
//       if (err.response) {
//         console.log(
//           `Request ${i}:`,
//           err.response.status,
//           err.response.data.message || err.response.data
//         );
//       } else {
//         console.log(`Request ${i}:`, err.message);
//       }
//     }
//   }
// }

// testRateLimit();

import axios from "axios";

const URL = "http://localhost:3000/";

async function testParallel() {
  const promises = [];

  for (let i = 1; i <= 30; i++) {
    promises.push(
      axios.get(URL)
        .then(res => console.log(`Request ${i}:`, res.status, res.data))
        .catch(err => {
          if (err.response) {
            console.log(`Request ${i}:`, err.response.status, err.response.data.message);
          } else {
            console.log(`Request ${i}:`, err.message);
          }
        })
    );
  }

  await Promise.all(promises);
}

testParallel();
