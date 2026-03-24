const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('pdf-parse');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Tu clave de API de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/analyze', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('No se subió ningún archivo.');
        const data = await pdf(req.file.buffer);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(`Analizá este examen: ${data.text}`);
        const response = await result.response;
        res.json({ analysis: response.text() });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el análisis');
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
