const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/didi', async (req, res) => {
  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        contents: [
          {
            role: "user",
            parts: [{ text: req.body.prompt }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GEMINI_API_KEY // ✅ your .env variable
        }
      }
    );

    const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    res.json({ reply: textResponse });
  } catch (error) {
    console.error('Gemini Proxy Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Gemini failed', details: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Gemini Proxy running at http://localhost:${PORT}`);
});
