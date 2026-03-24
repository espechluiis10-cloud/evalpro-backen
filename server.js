const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Asegúrate de que node-fetch esté en tu package.json
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/analizar', async (req, res) => {
  try {
    const { parts } = req.body;

    // VALIDACIÓN: Si no hay datos, evitamos que la IA falle
    if (!parts || !Array.isArray(parts) || parts.length === 0) {
      return res.status(400).json({ error: "No se recibió contenido para analizar." });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: parts
        }],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.2
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Error de la IA:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    // Enviamos la respuesta de la IA de vuelta al frontend
    res.json(data);

  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ error: "Error interno en el servidor." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
