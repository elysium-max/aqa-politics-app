import { FeedbackRequest } from "./services/claude";
import { generateFeedback } from "./services/feedbackGenerator";

async function runTests() {
  try {
    // Test for Paper 1 using a 9-marker question
    const testFeedback1: FeedbackRequest = {
      paper: "UK Government and Politics",
      questionType: "9-marker",
      examQuestion: "Discuss the impact of the House of Lords on the UK legislative process.",
      studentResponse:
        "The House of Lords plays a role in revising bills but does not have strong powers, so its impact is limited.",
    };

    console.log("Test Feedback 1 (9-marker, Paper 1):");
    const feedback1 = await generateFeedback(testFeedback1);
    console.log(feedback1);

    // Test for Paper 2 using a Comparative essay question
    const testFeedback2: FeedbackRequest = {
      paper: "US and Comparative Politics",
      questionType: "Comparative essay",
      examQuestion:
        "Compare the executive powers of the US President and the UK Prime Minister.",
      studentResponse:
        "The US President has significant veto powers and a fixed term, whereas the UK Prime Minister is more dependent on parliamentary confidence, although both roles have influential executive functions.",
    };

    console.log("\nTest Feedback 2 (Comparative essay, Paper 2):");
    const feedback2 = await generateFeedback(testFeedback2);
    console.log(feedback2);

    // Test for Paper 3 using an Extract question
    const testFeedback3: FeedbackRequest = {
      paper: "Political Ideas",
      questionType: "Extract question",
      examQuestion:
        "Evaluate the following extract from a text by a key political theorist.",
      extractText:
        "“The nature of political power is such that only those who understand its mechanisms can hope to control it.”",
      studentResponse:
        "The extract suggests that political power is complex and reserved for an enlightened few, but the student does not fully explore this idea.",
    };

    console.log("\nTest Feedback 3 (Extract question, Paper 3):");
    const feedback3 = await generateFeedback(testFeedback3);
    console.log(feedback3);
  } catch (error) {
    console.error("Error during API integration testing:", error);
  }
}

runTests();