import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const API_KEY = process.env.GEMINI_KEY;

app.post("/analizar", async (req, res) => {
  try {
    const { messages } = req.body;
    
    let parts = [];
    for (const msg of messages) {
      if (typeof msg.content === 'string') {
        parts.push({ text: msg.content });
      } else if (Array.isArray(msg.content)) {
        for (const block of msg.content) {
          if (block.type === 'text') {
            parts.push({ text: block.text });
          } else if (block.type === 'document' && block.source?.type === 'base64') {
            parts.push({
              inlineData: {
                mimeType: block.source.media_type,
                data: block.source.data
              }
            });
          }
        }
      }
    }

    const response = await fetch(
      `https://evalpro-backet.ondender.com/analizar`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: parts }],
          generationConfig: { maxOutputTokens: 1500, temperature: 0.3 }
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      return res.status(400).json({ error: data.error });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.json({ content: [{ type: "text", text }] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
