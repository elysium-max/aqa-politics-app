import express, { Request, Response } from 'express';
// Update the import for FeedbackRequest to come from the correct file
import { FeedbackRequest } from '../services/feedbackGenerator';
import { generateFeedback } from '../services/feedbackGenerator';

const router = express.Router();

// Valid paper options
const validPaperOptions = [
  'UK Government and Politics',
  'US and Comparative Politics',
  'Political Ideas'
];

// Valid question types per paper
const validQuestionTypes: Record<string, string[]> = {
  'UK Government and Politics': ["9-marker", "Extract question", "Essay"],
  'Political Ideas': ["9-marker", "Extract question", "Essay"],
  'US and Comparative Politics': ["9-marker", "Comparative 9-marker", "Extract question", "Comparative essay"],
};

router.post('/analyze', async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('Received request body:', req.body);

    // Destructure the expected fields from the request body
    const { paper, questionType, examQuestion, extractText, studentResponse } =
      req.body as Partial<FeedbackRequest>;

    // Validate paper
    if (!paper || typeof paper !== 'string' || !validPaperOptions.includes(paper)) {
      return res.status(400).json({
        error: 'Invalid request format',
        message: 'Paper is required and must be one of the valid options',
        validPapers: validPaperOptions,
      });
    }

    // Validate questionType
    if (!questionType || typeof questionType !== 'string') {
      return res.status(400).json({
        error: 'Invalid request format',
        message: 'Question type is required and must be a string',
        validQuestionTypes: validPaperOptions.includes(paper) ? validQuestionTypes[paper] : [],
      });
    }
    if (!validQuestionTypes[paper] || !validQuestionTypes[paper].includes(questionType)) {
      return res.status(400).json({
        error: 'Invalid request format',
        message: 'Invalid question type for the selected paper',
        validQuestionTypes: validQuestionTypes[paper],
      });
    }

    // Validate examQuestion
    if (!examQuestion || typeof examQuestion !== 'string') {
      return res.status(400).json({
        error: 'Invalid request format',
        message: 'Exam question is required and must be a string',
        requiredFields: { examQuestion: 'string (required)' },
      });
    }

    // Validate studentResponse
    if (!studentResponse || typeof studentResponse !== 'string') {
      return res.status(400).json({
        error: 'Invalid request format',
        message: 'Student response is required and must be a string',
        requiredFields: { studentResponse: 'string (required)' },
      });
    }

    // For "Extract question", ensure extractText is provided.
    if (questionType === "Extract question" && (!extractText || typeof extractText !== 'string' || !extractText.trim())) {
      return res.status(400).json({
        error: 'Invalid request format',
        message: 'For an Extract question, extract text is required',
        requiredFields: { extractText: 'string (required for Extract question)' },
      });
    }

    const feedbackRequest: FeedbackRequest = {
      paper,
      questionType,
      examQuestion,
      extractText,
      studentResponse,
    };

    // Await the promise from generateFeedback
    const feedback = await generateFeedback(feedbackRequest);

    return res.json(feedback);
  } catch (error) {
    console.error('Feedback generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate feedback',
      message: error instanceof Error ? error.message : 'Unknown server error',
      details: { timestamp: new Date().toISOString() },
    });
  }
});

export default router;