document.addEventListener("DOMContentLoaded", () => {
    const answerList = document.getElementById("answer-list");
    const addButton = document.getElementById("add-answer");
    const removeButton = document.getElementById("remove-answer");


    // Add logic for assigning correct answer
    let correctAnswer = "Answer 2"; // Set a correct answer
    let answerCount = 5; // Initial number of answers

    function renderButtons() {
        // Clear current buttons
        answerList.innerHTML = "";

        // Create new buttons based on answerCount
        for (let i = 1; i <= answerCount; i++) {
            const li = document.createElement("li");
            li.classList.add("fancy-button");
            li.textContent = `Answer ${i}`;

            // Add click event listener for checking answer
            li.addEventListener("click", () => {
                // Remove previous selections
                document.querySelectorAll(".fancy-button").forEach(btn => btn.classList.remove("correct", "incorrect"));

                if (li.textContent === correctAnswer) {
                    li.classList.add("correct");
                } else {
                    li.classList.add("incorrect");
                }
            });

            answerList.appendChild(li);
        }
    }

    // Add answer button logic
    addButton.addEventListener("click", () => {
        answerCount++;
        renderButtons();
    });

    // Remove answer button logic
    removeButton.addEventListener("click", () => {
        if (answerCount > 1) { // Ensure at least one answer remains
            answerCount--;
            renderButtons();
        }
    });

    // Initial rendering of buttons
    renderButtons();
});
        
