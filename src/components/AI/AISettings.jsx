import { Bot, Cpu, Info } from 'lucide-react';

export default function AISettings({ selectedModel, onModelChange, models }) {
  return (
    <div className="px-6 py-4 bg-purple-50/50 border-b border-purple-100">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-gray-800">AI Model</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className={`
                  p-3 rounded-xl text-left transition-all border
                  ${selectedModel === model.id
                    ? 'bg-white border-purple-500 shadow-sm'
                    : 'bg-white/50 border-transparent hover:bg-white hover:border-gray-200'
                  }
                `}
              >
                <p className={`font-medium text-sm ${selectedModel === model.id ? 'text-purple-700' : 'text-gray-700'}`}>
                  {model.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{model.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-3 p-3 bg-blue-50 rounded-xl flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Currently using simulated AI responses. To connect to Ollama:
              <br />
              1. Install Ollama from{' '}
              <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="underline">ollama.com</a>
              <br />
              2. Run: <code className="bg-blue-100 px-1 rounded">ollama run {selectedModel}</code>
              <br />
              3. Update the API endpoint in ChatContext.jsx
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
