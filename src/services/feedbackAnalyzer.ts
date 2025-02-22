import fetch from "node-fetch";
import { FeedbackRequest, FeedbackResponse } from "./feedbackGenerator";
import { config } from "../config";

// Define the interface for Anthropic API's response message structure.
interface AnthropicApiResponse {
  content: Array<{
    text: string;
    type: string;
  }>;
}

/**
 * Extracts the first balanced JSON object from a string.
 * Iterates the string starting from the first occurrence of '{' and returns the substring
 * for which the opening and closing braces balance.
 *
 * @param text The input text from which to extract the JSON.
 * @returns The JSON substring if found.
 * @throws An error if no balanced JSON object can be extracted.
 */
function extractJSONObject(text: string): string {
  const start = text.indexOf('{');
  if (start === -1) {
    throw new Error("No JSON object found in text.");
  }
  let braceCount = 0;
  let end = -1;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') {
      braceCount++;
    } else if (text[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end === -1) {
    throw new Error("Incomplete JSON object in text.");
  }
  return text.substring(start, end);
}

/**
 * Calls the Anthropic API (Claude‑3.5) and returns detailed analysis in a structured format.
 *
 * @param request The feedback request containing the student response and context.
 * @returns A promise that resolves to a detailed FeedbackResponse.
 * @throws An error if the API call fails or the returned response cannot be parsed.
 */
export async function analyzeFeedback(
  request: FeedbackRequest
): Promise<FeedbackResponse> {
  const { claudeApiKey: apiKey, claudeApiEndpoint: endpoint, claudeModel: model } = config;
  
  if (!apiKey || !endpoint) {
    throw new Error("Anthropic API key or endpoint is not configured.");
  }
  
  // Updated prompt: Removed qualityIndicator altogether.
  const promptContent = `
Analyze the following student response in detail. Provide strengths, weaknesses, improvements, and technicalNotes.

Feedback Context:
- Paper: ${request.paper}
- Question Type: ${request.questionType}
- Exam Question: ${request.examQuestion}
${request.extractText ? `- Extract Text: ${request.extractText}` : ""}

Student Response:
${request.studentResponse}

Guidelines:
- For "Extract question": Focus on key quotes, provenance, and integration of wider knowledge.
- For "9-marker": Emphasize three distinct analytical points with robust evidence.
- For "Essay": Focus on sustained analysis, synoptic links, current examples, and well-rounded evaluation.
- Avoid boilerplate remarks; provide detailed, personalized feedback.
- Include technical notes on vocabulary, linking evidence, paragraph structure, and overall relevance.

Return your answer strictly as valid JSON with the properties: strengths, weaknesses, improvements, technicalNotes.
  `;
  
  // Build the payload with proper parameters.
  const payload = {
    model,
    system: "You are an experienced A-Level Politics teacher grading student responses. Provide detailed, constructive feedback based on AQA marking criteria.",
    messages: [
      {
        role: "user",
        content: promptContent,
      }
    ],
    max_tokens: 800,
    temperature: 0.7,
  };

  console.log("Payload being sent to Anthropic API:");
  console.log(JSON.stringify(payload, null, 2));

  // Make the API call.
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API request failed with status ${response.status}: ${errorBody}`);
  }

  const data: AnthropicApiResponse = await response.json();
  console.log("Received API response:", data);

  // Get the full text from the API response.
  const responseText = data.content[0].text;
  
  // Extract a balanced JSON object from the response text.
  const jsonPart = extractJSONObject(responseText);
  console.log("Extracted JSON part:", jsonPart);

  const parsedResponse = JSON.parse(jsonPart);

  return {
    strengths: parsedResponse.strengths,
    weaknesses: parsedResponse.weaknesses,
    improvements: parsedResponse.improvements,
    technicalNotes: parsedResponse.technicalNotes,
  };
}