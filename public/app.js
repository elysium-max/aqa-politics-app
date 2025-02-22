document.addEventListener("DOMContentLoaded", () => {
  // Get all required DOM elements
  const elements = {
    paperSelect: document.getElementById("paperSelect"),
    questionTypeSelect: document.getElementById("questionTypeSelect"),
    examQuestion: document.getElementById("examQuestion"),
    extractText: document.getElementById("extractText"),
    studentResponse: document.getElementById("studentResponse"),
    submitBtn: document.getElementById("submitBtn"),
    feedbackDisplay: document.getElementById("feedbackDisplay"),
    sectionPaper: document.getElementById("sectionPaper"),
    sectionQuestionType: document.getElementById("sectionQuestionType"),
    sectionExamQuestion: document.getElementById("sectionExamQuestion"),
    sectionExtract: document.getElementById("sectionExtract"),
    sectionStudentResponse: document.getElementById("sectionStudentResponse"),
    sectionSubmit: document.getElementById("sectionSubmit")
  };

  // Check if any required elements are missing
  const missingElements = Object.entries(elements)
    .filter(([_, element]) => !element)
    .map(([name]) => name);

  if (missingElements.length > 0) {
    console.error("Critical elements missing from DOM:", missingElements);
    return;
  }

  // Destructure elements for easier access
  const {
    paperSelect,
    questionTypeSelect,
    examQuestion,
    extractText,
    studentResponse,
    submitBtn,
    feedbackDisplay,
    sectionQuestionType,
    sectionExamQuestion,
    sectionExtract,
    sectionStudentResponse,
    sectionSubmit
  } = elements;

  // Render formatted feedback using the provided feedback object.
  // Removed quality indicator section.
  function renderFeedback(feedback) {
    return `
      <div class="feedback-container space-y-4">
        <div class="feedback-section">
          <h3 class="text-lg font-semibold">Strengths</h3>
          <ul class="list-disc list-inside">
            ${Array.isArray(feedback.strengths) && feedback.strengths.length > 0 
              ? feedback.strengths.map(point => `<li>${point}</li>`).join('') 
              : '<li>No strengths provided</li>'}
          </ul>
        </div>
        <div class="feedback-section">
          <h3 class="text-lg font-semibold">Weaknesses</h3>
          <ul class="list-disc list-inside">
            ${Array.isArray(feedback.weaknesses) && feedback.weaknesses.length > 0 
              ? feedback.weaknesses.map(point => `<li>${point}</li>`).join('') 
              : '<li>No weaknesses identified</li>'}
          </ul>
        </div>
        <div class="feedback-section">
          <h3 class="text-lg font-semibold">Improvements</h3>
          <ul class="list-disc list-inside">
            ${Array.isArray(feedback.improvements) && feedback.improvements.length > 0 
              ? feedback.improvements.map(point => `<li>${point}</li>`).join('') 
              : '<li>No improvements suggested</li>'}
          </ul>
        </div>
        <div class="feedback-section">
          <h3 class="text-lg font-semibold">Technical Notes</h3>
          <ul class="list-disc list-inside">
            ${Array.isArray(feedback.technicalNotes) && feedback.technicalNotes.length > 0 
              ? feedback.technicalNotes.map(note => `<li>${note}</li>`).join('') 
              : '<li>No technical notes provided</li>'}
          </ul>
        </div>
      </div>
    `;
  }

  // Function to update question types based on selected paper
  function updateQuestionTypes() {
    const paper = paperSelect.value;
    console.log("Updating question types for paper:", paper);

    let types = [];
    if (paper === "US and Comparative Politics") {
      types = [
        "9-marker",
        "Comparative 9-marker",
        "Extract question",
        "Comparative essay"
      ];
    } else if (paper === "UK Government and Politics" || paper === "Political Ideas") {
      types = [
        "9-marker",
        "Extract question",
        "Essay"
      ];
    }

    // Reset question type dropdown
    questionTypeSelect.innerHTML = '<option value="">-- Choose Question Type --</option>';

    // Add new options
    types.forEach(type => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      questionTypeSelect.appendChild(option);
    });
    console.log("Question types updated:", types);
  }

  // Handle paper selection changes
  paperSelect.addEventListener("change", () => {
    console.log("Paper selection changed to:", paperSelect.value);

    if (paperSelect.value) {
      updateQuestionTypes();
      sectionQuestionType.classList.remove("hidden");

      // Hide subsequent sections when paper changes
      sectionExamQuestion.classList.add("hidden");
      sectionExtract.classList.add("hidden");
      sectionStudentResponse.classList.add("hidden");
      sectionSubmit.classList.add("hidden");
    } else {
      // Hide all sections if no paper selected
      sectionQuestionType.classList.add("hidden");
      sectionExamQuestion.classList.add("hidden");
      sectionExtract.classList.add("hidden");
      sectionStudentResponse.classList.add("hidden");
      sectionSubmit.classList.add("hidden");
    }
  });

  // Handle question type selection changes
  questionTypeSelect.addEventListener("change", () => {
    console.log("Question type changed to:", questionTypeSelect.value);

    if (questionTypeSelect.value) {
      // Show common sections
      sectionExamQuestion.classList.remove("hidden");
      sectionStudentResponse.classList.remove("hidden");
      sectionSubmit.classList.remove("hidden");

      // Show/hide extract section based on question type
      if (questionTypeSelect.value === "Extract question") {
        sectionExtract.classList.remove("hidden");
      } else {
        sectionExtract.classList.add("hidden");
      }
    } else {
      // Hide all dependent sections if no question type selected
      sectionExamQuestion.classList.add("hidden");
      sectionExtract.classList.add("hidden");
      sectionStudentResponse.classList.add("hidden");
      sectionSubmit.classList.add("hidden");
    }
  });

  // Handle form submission
  submitBtn.addEventListener("click", async () => {
    try {
      // Prepare payload
      const payload = {
        paper: paperSelect.value,
        questionType: questionTypeSelect.value,
        examQuestion: examQuestion.value,
        extractText: extractText.value,
        studentResponse: studentResponse.value
      };

      console.log("Submitting feedback request:", payload);

      // Send request to backend
      const response = await fetch("/api/feedback/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log("Feedback received:", result);

      // Display formatted feedback
      feedbackDisplay.innerHTML = renderFeedback(result);
    } catch (error) {
      console.error("Error generating feedback:", error);
      feedbackDisplay.innerHTML = `
        <div class="text-red-500">
          <p>Error generating feedback.</p>
          <p>${error.message}</p>
        </div>
      `;
    }
  });

  console.log("App initialized successfully");
});