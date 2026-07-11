// AI Provider configuration
// Edit this file to switch between providers (Groq, OpenRouter, etc.)

const provider = {
  // Provider metadata
  name: 'Groq',
  keyEnvVar: 'GROQ_API_KEY',
  keyLink: 'https://console.groq.com/keys',
  keyNote: 'Get a free Groq API key (no credit card required)',

  // API endpoint
  baseUrl: 'https://api.groq.com/openai/v1',
  chatEndpoint: 'https://api.groq.com/openai/v1/chat/completions',

  // Whether all models on this provider are free
  allModelsFree: true,

  // Default model
  defaultModel: 'llama-3.3-70b-versatile',

  // Additional headers (none needed for Groq beyond Authorization)
  headers: {},
};

export default provider;
