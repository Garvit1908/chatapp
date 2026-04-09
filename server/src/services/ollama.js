import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// Available models configuration
export const getAvailableModels = () => [
  { id: 'llama3.2', name: 'Llama 3.2', description: 'Fast and efficient local model' },
  { id: 'llama3.1', name: 'Llama 3.1', description: 'Balanced performance' },
  { id: 'mistral', name: 'Mistral', description: 'Great for conversations' },
  { id: 'codellama', name: 'Code Llama', description: 'Optimized for code' }
];

export async function fetchOllamaResponse(message, model = 'llama3.2') {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        prompt: message,
        stream: false
      })
    });

    if (!response.ok) {
      if (response.status === 404) {
        return `Ollama is not running. Please:\n1. Install Ollama from https://ollama.com\n2. Run: ollama run ${model}`;
      }
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Ollama fetch error:', error);
    return `Error connecting to Ollama. Make sure Ollama is running at ${OLLAMA_URL} and the model "${model}" is installed.`;
  }
}

// For streaming responses via Socket.io
export async function* streamOllamaResponse(message, model = 'llama3.2') {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        prompt: message,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response) {
            yield data.response;
          }
          if (data.done) break;
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    }
  } catch (error) {
    console.error('Stream error:', error);
    yield 'Error: Could not connect to Ollama. Make sure it is running.';
  }
}
