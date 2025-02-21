document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById('submitBtn');
    const questionInput = document.getElementById('questionInput');
    const feedbackDisplay = document.getElementById('feedbackDisplay');

    submitBtn.addEventListener('click', async () => {
        const response = document.querySelector('#questionInput').value;
        
        if (!response.trim()) {
            alert('Please enter your response first');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Getting feedback...';

        try {
            const result = await getFeedback(response);
            displayFeedback(result);
        } catch (error) {
            feedbackDisplay.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Get Feedback';
        }
    });

    async function getFeedback(response) {
        // This is where we'll add the Claude API integration
        // For now, return mock feedback
        return {
            strengths: ['Good structure', 'Clear argument'],
            improvements: ['Add more examples', 'Expand analysis'],
            score: 15,
            totalMarks: 25
        };
    }

    function displayFeedback(feedback) {
        feedbackDisplay.innerHTML = `
            <div class="space-y-4">
                <div>
                    <h3 class="font-semibold text-lg text-green-600">Strengths:</h3>
                    <ul class="list-disc pl-5">
                        ${feedback.strengths.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
                
                <div>
                    <h3 class="font-semibold text-lg text-amber-600">Areas for Improvement:</h3>
                    <ul class="list-disc pl-5">
                        ${feedback.improvements.map(i => `<li>${i}</li>`).join('')}
                    </ul>
                </div>

                <div class="mt-4 p-4 bg-gray-50 rounded-md">
                    <p class="font-semibold">Estimated Score: ${feedback.score}/${feedback.totalMarks}</p>
                </div>
            </div>
        `;
    }
});