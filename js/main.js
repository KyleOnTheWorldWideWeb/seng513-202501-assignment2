import { User } from "./models/user.js";
import { Quiz } from "./models/quiz.js";
import { Question } from "./models/question.js";
import { questionGenerator } from "./services/question-generator.js";

// Grab references to HTML elements (adjust IDs if needed)
const questionElem = document.getElementById("question");
const answerListElem = document.getElementById("answer-list");

// We'll add a "Next Question" button to let the user see feedback first
let nextButton = null;
let quiz = null;
let quizSession = false;
let gen = null;

export function startQuiz(user, categoryURL) {
  try {
    quiz = new Quiz(user, categoryURL);
    gen = questionGenerator(quiz);
    quizSession = true;
    console.log("Quiz has started!");
    displayNextQuestion();
  } catch (error) {
    console.error("Error starting quiz:", error);
    questionElem.textContent = "Failed to start the quiz. Please try again.";
    answerListElem.innerHTML = "";
  }
}

/**
 * displayNextQuestion:
 * - The generator's next yield is a question object
 * - If done, quiz is finished
 * - Otherwise, render it
 */
async function displayNextQuestion() {
  try {
    const { value, done } = await gen.next();
    console.log("Received from generator:", value); // Log generator output

    if (done || !value) {
      questionElem.textContent = "No more questions!";
      answerListElem.innerHTML = "";
      return;
    }

    if (value.type === "question") {
      console.log("Displaying new question:", value.question);
      quiz.currentQuestion = value.question; // ✅ Explicitly assign the question
      renderQuestion(value.question);
    } else if (value.type === "feedback") {
      console.log("Displaying feedback:", value);
    } else {
      console.error("Unexpected generator output:", value);
    }
  } catch (error) {
    console.error("Error displaying next question:", error);
    questionElem.textContent = "An error occurred. Please try again.";
    answerListElem.innerHTML = "";
  }
}

/**
 * Renders a question onto the page:
 * - Displays the question text
 * - Creates clickable buttons for each choice
 */
function renderQuestion(question) {
  questionElem.innerHTML = question.text;
  answerListElem.innerHTML = "";

  question.choices.forEach((choice) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.innerHTML = choice;
    btn.setAttribute("data-answer", question.answer);
    btn.addEventListener("click", () => handleAnswer(choice, btn, question));
    li.appendChild(btn);
    answerListElem.appendChild(li);
  });
}

/**
 * Called when the user selects an answer:
 * - Disables all buttons to prevent multiple answers
 * - Resumes the generator with user's choice -> gen.next(choice)
 * - Highlights correct/incorrect answers and shows feedback
 */
async function handleAnswer(choice, clickedButton, question) {
  console.log("ANSWER CLICKED:", choice);

  if (!quiz.currentQuestion) {
    console.error("ERROR: `handleAnswer` called but no active question!");
    return;
  }

  // Disable all buttons
  const buttons = answerListElem.querySelectorAll("button");
  buttons.forEach((btn) => (btn.disabled = true));

  try {
    console.log("Calling gen.next() with choice:", choice);
    const { value, done } = await gen.next(choice);
    console.log("Received from generator:", value, "Done:", done);

    if (!value) {
      console.error("No feedback received from generator.");
      return;
    }

    if (value.type === "feedback") {
      console.log("Processing feedback:", value.feedback);
      highlightAnswers(value.isCorrect, question, clickedButton);

      const msg = document.createElement("p");
      msg.innerHTML = value.feedback;
      msg.className = `feedback ${
        value.isCorrect ? "correct-feedback" : "incorrect-feedback"
      }`;
      answerListElem.appendChild(msg);

      console.log("Checking if `showNextButton()` is called...");

      if (!done) {
        console.log("Calling showNextButton() after feedback!");
        showNextButton();
      } else {
        console.log("Generator finished. No more questions.");
      }
    } else if (value.type === "completion") {
      console.log("Generator says quiz is completed!");
      displayFinishedState();
    } else if (value.type === "question") {
      console.log("Generator yielded a new question:", value.question.text);
      quiz.currentQuestion = value.question;
      renderQuestion(value.question);
    } else {
      console.error("Generator yielded unexpected value:", value);
    }
  } catch (error) {
    console.error("Error handling answer:", error);
    buttons.forEach((btn) => (btn.disabled = false));
  }
}

/**
 * Highlights correct and incorrect answers.
 */
function highlightAnswers(isCorrect, question, clickedButton) {
  const buttons = answerListElem.querySelectorAll("button");
  buttons.forEach((btn) => {
    btn.classList.remove("correct", "incorrect");
  });

  if (isCorrect) {
    clickedButton.classList.add("correct");
  } else {
    clickedButton.classList.add("incorrect");
    buttons.forEach((btn) => {
      if (btn.textContent === question.answer) {
        btn.classList.add("correct");
      }
    });
  }
}

/**
 * Shows a "Next Question" button so the user can proceed.
 */
function showNextButton() {
  console.log(
    "showNextButton() called - ensuring 'Next Question' button appears!"
  );

  let existingButton = document.querySelector(".next-button");

  if (!existingButton) {
    console.log("Creating new 'Next Question' button...");
    nextButton = document.createElement("button");
    nextButton.textContent = "Next Question";
    nextButton.className = "next-button";

    nextButton.addEventListener("click", async () => {
      console.log(
        "Next Question button clicked - Calling displayNextQuestion()"
      );
      await displayNextQuestion();
    });

    answerListElem.appendChild(nextButton);
  } else {
    console.log("'Next Question' button already exists.");
  }

  // Log button visibility and properties
  existingButton = document.querySelector(".next-button");
  if (existingButton) {
    console.log("Button found in DOM:", existingButton);
    console.log(
      "Button display style:",
      getComputedStyle(existingButton).display
    );
  } else {
    console.log("Button is missing from the DOM!");
  }

  if (existingButton) existingButton.style.display = "block";
}

/**
 * Display a "quiz finished" message when the generator is done.
 */
function displayFinishedState() {
  questionElem.textContent = "Quiz finished!";
  answerListElem.innerHTML = "";
  if (nextButton) nextButton.style.display = "none";
}

function resetQuiz() {
  quiz = null;
  quizSession = false;
  gen = null;
  questionElem.textContent = "";
  answerListElem.innerHTML = "";
  if (nextButton) nextButton.style.display = "none";
}

// Add a reset button to the UI
const resetButton = document.createElement("button");
resetButton.textContent = "Reset Quiz";
resetButton.addEventListener("click", resetQuiz);
document.body.appendChild(resetButton);

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Fetches new questions from the Open Trivia DB API and adds them to the quiz.
 * @param {Quiz} quiz - The quiz instance to store new questions.
 * @yields {Question} The next question from the API
 * @throws {Error} When API request fails or response is invalid
 */
