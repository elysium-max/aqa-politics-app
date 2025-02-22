import Anthropic from '@anthropic-ai/sdk';
import MessageParam from '@anthropic-ai/sdk';
import { config } from '../config';

const DEBUG = process.env.NODE_ENV !== 'production';

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
  qualityIndicator: 'requires improvement' | 'good' | 'excellent';
}

class ClaudeService {
  private client: Anthropic;
  private static instance: ClaudeService;

  private constructor() {
    if (DEBUG) {
      console.log('Environment variables loaded:', {
        nodeEnv: process.env.NODE_ENV,
        hasClaudeKey: !!config.claudeApiKey,
      });
    }
    this.client = new Anthropic({
      apiKey: config.claudeApiKey,
    });
  }

  public static getInstance(): ClaudeService {
    if (!ClaudeService.instance) {
      ClaudeService.instance = new ClaudeService();
    }
    return ClaudeService.instance;
  }

  async analyzePoliticsResponse(request: FeedbackRequest): Promise<FeedbackResponse> {
    try {
      if (DEBUG) {
        console.log('Sending request to Claude API:', request);
      }
      const prompt = this.buildPrompt(request);
      const messages: MessageParam.MessageParam[] = [
        {
          role: 'user',
          content: prompt,
        },
      ];

      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        temperature: 0.7,
        messages,
        system:
          'You are an experienced A-Level Politics teacher grading student responses. Provide detailed, constructive feedback based on AQA marking criteria. Tailor your feedback based on the paper and question type provided.',
      });

      const responseText =
        response.content[0].type === 'text'
          ? response.content[0].text
          : '';
      if (DEBUG) {
        console.log('Received response from Claude API:', responseText);
      }
      return this.parseResponse(responseText);
    } catch (error) {
      console.error('Error analyzing response:', error);
      throw new Error('Failed to analyze response');
    }
  }

  private buildPrompt(request: FeedbackRequest): string {
    const extractPart =
      request.questionType === 'Extract question' && request.extractText
        ? `Extract Text: ${request.extractText}\n`
        : '';

    return `
Please analyze this A-Level Politics response:

Paper: ${request.paper}
Question Type: ${request.questionType}
Exam Question: ${request.examQuestion}
${extractPart}  
Student Response: ${request.studentResponse}

Provide a detailed analysis in JSON format with the following structure:
{
  "strengths": ["list of key strengths"],
  "weaknesses": ["areas needing improvement"],
  "improvements": ["specific suggestions"],
  "estimatedMark": number (out of maximum marks),
  "breakdown": {
    "knowledge": number (0-5),
    "analysis": number (0-5),
    "evaluation": number (0-5)
  },
  "examplePoints": ["relevant examples that could strengthen the answer"]
}
    `;
  }

  private parseResponse(response: string): FeedbackResponse {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      const parsedResponse = JSON.parse(jsonMatch[0]);
      // Determine qualityIndicator based on breakdown scores if available.
      const qualityIndicator = this.determineQualityIndicator(
        parsedResponse.breakdown?.knowledge || 0,
        parsedResponse.breakdown?.analysis || 0,
        parsedResponse.breakdown?.evaluation || 0
      );
      
      return {
        strengths: parsedResponse.strengths || [],
        weaknesses: parsedResponse.weaknesses || [],
        improvements: parsedResponse.improvements || [],
        qualityIndicator,
      };
    } catch (error) {
      console.error('Error parsing Claude response:', error);
      return {
        strengths: ['Unable to generate specific strengths'],
        weaknesses: ['Unable to generate specific weaknesses'],
        improvements: ['Please review and revise your response'],
        qualityIndicator: 'requires improvement',
      };
    }
  }

  private determineQualityIndicator(
    knowledge: number,
    analysis: number,
    evaluation: number
  ): FeedbackResponse['qualityIndicator'] {
    const totalScore = knowledge + analysis + evaluation;
    const maxPossibleScore = 15; // 5 points each for 3 categories
    const percentageScore = (totalScore / maxPossibleScore) * 100;
    if (percentageScore < 40) {
      return 'requires improvement';
    } else if (percentageScore < 70) {
      return 'good';
    } else {
      return 'excellent';
    }
  }
}

export const claudeService = ClaudeService.getInstance();