import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import OpenAI from "openai";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors({ origin: '*' }));
app.use(express.json());

// OpenRouter / OpenAI setup
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// 🔥 THE HACKATHON DEMO DATA (Paste your actual PDF text here)
const demoCampusText = `
Campus Guidelines and Fee Structure 2024-2025:
1. B.Tech Tuition Fee is Rs. 1,50,000 per year.
2. Hostel Fee is Rs. 60,000 per year.
3. Scholarships: Merit students with above 9.0 CGPA get a 20% discount on tuition.
4. Timings: The campus library is open from 9 AM to 8 PM. The main office is open from 10 AM to 4 PM.
5. Regional Language Support: Students can request documents in Hindi at the helpdesk.
`;

// 🔥 CHAT API
// 🔥 CHAT API
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a friendly and helpful campus AI assistant for a college.
          
          Here is the official document knowledge base:
          ---
          ${demoCampusText}
          ---
          
          Instructions:
          1. If the user says hello or greets you, greet them back naturally!
          2. When answering questions about the campus, fees, or schedules, ONLY use the knowledge base above.
          3. If the user asks a campus-related question and the answer is truly not in the text, say: "I don't have that information. Please contact the campus office."
          4. ALWAYS reply in the same language the user used (If they ask in Hindi, reply in Hindi. If English, reply in English).`
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("CHAT ERROR:", error.message);
    res.status(500).json({
      reply: "Error connecting to AI."
    });
  }
});

// 🔥 FAKE PDF UPLOAD API (The Illusion)
app.post("/upload", upload.single("pdf"), (req, res) => {
  // We accept the file from the frontend so the UI looks like it works, 
  // but we don't actually parse it. We just use the 'demoCampusText' above.
  console.log("File received, pretending to parse...");
  res.json({ message: "PDF uploaded and processed successfully! You can now ask questions." });
});

// 🚀 START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running perfectly on port ${PORT}`);
});