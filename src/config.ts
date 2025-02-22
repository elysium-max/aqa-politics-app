import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

if (!process.env.CLAUDE_API_KEY) {
  throw new Error("CLAUDE_API_KEY is not defined in environment variables");
}

if (!process.env.CLAUDE_API_ENDPOINT) {
  throw new Error("CLAUDE_API_ENDPOINT is not defined in environment variables");
}

export const config = {
  port: process.env.PORT || 3000,
  claudeApiKey: process.env.CLAUDE_API_KEY,
  // Use the /v1/messages endpoint for Claude‑3.5 Haiku
  claudeApiEndpoint: process.env.CLAUDE_API_ENDPOINT, 
  // Set your model here; for example with Claude‑3.5 Haiku:
  claudeModel: process.env.CLAUDE_MODEL || "claude-3-5-haiku-20241022",
};