import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Lazy init for Gemini
let genAI: GoogleGenAI | null = null;
function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not defined');
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAI;
}

// Lazy init for Razorpay
let razorpay: Razorpay | null = null;
function getRazorpay() {
  if (!razorpay) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error('Razorpay credentials are not defined');
    }
    razorpay = new Razorpay({ key_id, key_secret });
  }
  return razorpay;
}

// API Routes
app.post('/api/ai/generate-questions', async (req, res) => {
  try {
    const { text, count = 5, difficulty = 'Medium' } = req.body;
    const ai = getGenAI();
    
    const prompt = `Generate ${count} multiple choice questions from the following text in JSON format. 
    Difficulty: ${difficulty}.
    The JSON should be an array of objects with fields: question, options (array of 4 strings), correctOption (index 0-3), and explanation.
    Text: ${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });
    
    const questions = JSON.parse(response.text);
    
    res.json(questions);
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payments/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    const order = await getRazorpay().orders.create({
      amount: amount * 100, // amount in paisa
      currency,
      receipt,
    });
    res.json(order);
  } catch (error: any) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payments/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    // Verification logic here (using crypto.createHmac)
    // For now, simple mock verification
    res.json({ status: 'success' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
