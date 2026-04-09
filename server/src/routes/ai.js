import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { fetchOllamaResponse, getAvailableModels } from '../services/ollama.js';

const router = express.Router();

// Get available models
router.get('/models', authenticateToken, (req, res) => {
  const models = getAvailableModels();
  res.json(models);
});

// Chat with AI (REST endpoint for non-streaming)
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, model = 'llama3.2' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await fetchOllamaResponse(message, model);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
