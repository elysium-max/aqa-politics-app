import { analyzeFeedback } from "./feedbackAnalyzer";

export interface FeedbackRequest {
  paper: string;
  questionType: string;
  examQuestion: string;
  extractText?: string;
  studentResponse: string;
}

export interface FeedbackResponse {
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  technicalNotes: string[];
}

/**
 * Asynchronously generates personalized feedback using the Anthropic API (Claude).
 * If the API call fails, the error is propagated; no fallback fake feedback is provided.
 *
 * @param request The feedback request containing the student response and context.
 * @returns A promise that resolves to a detailed FeedbackResponse.
 * @throws An error if the API analysis fails.
 */
export async function generateFeedback(
  request: FeedbackRequest
): Promise<FeedbackResponse> {
  return await analyzeFeedback(request);
}