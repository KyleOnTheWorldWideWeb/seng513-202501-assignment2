import { User } from "./models/user.js";
import { Quiz } from "./models/quiz.js";
import { Question } from "./models/question.js";
import { questionGenerator } from "./services/question-generator.js";

// Grab references to HTML elements (adjust IDs if needed)

const questionElem = document.getElementById("question");
const answerListElem = document.getElementById("answer-list");

// We'll add a "Next Question" button to let the user see feedback first
let nextButton = null;

// We'll store the quizobject in a global variable so we can access it in multiple functions
let quiz = null;

// Global variable to track the quiz session
let quizSession = false;

let gen = null;

export function startQuiz(user, categoryURL) {
  try {
    // Create a new Quiz instance
    quiz = new Quiz(user, categoryURL);
    // Create a generator to manage the flow of quiz questions
    gen = questionGenerator(quiz);

    // Start the quiz
    quizSession = true;
    console.log("Quiz has started!");

    // Display the first question
    displayNextQuestion();

    //handling any sort of error
  } catch (error) {
    console.error("Error starting quiz:", error);
    questionElem.textContent = "Failed to start the quiz. Please try again.";
    answerListElem.innerHTML = "";
  }
}

/**
 * displayNextQuestion:
 *  - The generator's next yield is a question object
 *  - If done, quiz is finished
 *  - Otherwise, render it
 */
async function displayNextQuestion() {
  const { value, done } = await gen.next();

  console.log("hello", value);

  // If the generator is done or didn't yield a valid question
  if (done || !value) {
    questionElem.textContent = "No more questions!";
    answerListElem.innerHTML = "";
    return;
  }

  // If the generator yields { question, isCorrect },
  // we need to do renderQuestion(value.question) instead to show the
  // correct answer, score, etc.
  renderQuestion(value);
}

/**
 * Renders a question onto the page:
 *  - Displays the question text
 *  - Creates clickable buttons for each choice
 */
function renderQuestion(question) {
  // Show question text with proper HTML entity rendering
  questionElem.innerHTML = question.text;

  // Clear existing answers in the list
  answerListElem.innerHTML = "";

  // Create a button for each choice
  question.choices.forEach((choice) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    // Use innerHTML to properly render HTML entities
    btn.innerHTML = choice;
    btn.setAttribute("data-answer", question.answer);

    // On click, we pass the chosen answer to handleAnswer
    btn.addEventListener("click", () => handleAnswer(choice, btn, question));

    li.appendChild(btn);
    answerListElem.appendChild(li);
  });
}

/**
 * Called when the user selects an answer:
 * 1. Disable all buttons to prevent multiple answers
 * 2. Resume the generator with user's choice -> gen.next(choice).
 * 3. The generator yields an object: { question, isCorrect, feedback }.
 * 4. We highlight buttons and show feedback.
 */
async function handleAnswer(choice, clickedButton, question) {
  console.log("Answer clicked:", choice);
  
  // Disable all buttons to prevent multiple answers
  const buttons = answerListElem.querySelectorAll("button");
  buttons.forEach(btn => btn.disabled = true);
  
  try {
    // Resume generator to check correctness
    const { value, done } = await gen.next(choice);

    if (done) {
      displayFinishedState();
      return;
    }

    if (!value) {
      console.error("No feedback received from generator");
      return;
    }

    const { isCorrect, feedback } = value;

    // Highlight the correct / incorrect button(s)
    highlightAnswers(isCorrect, question, clickedButton);

    // Remove any existing feedback message
    const existingFeedback = answerListElem.querySelector(".feedback");
    if (existingFeedback) {
      existingFeedback.remove();
    }

    // Show feedback message with proper styling
    const msg = document.createElement("p");
    msg.innerHTML = feedback;
    msg.className = `feedback ${isCorrect ? "correct-feedback" : "incorrect-feedback"}`;
    msg.style.marginTop = "10px";
    msg.style.padding = "10px";
    msg.style.borderRadius = "5px";
    msg.style.textAlign = "center";
    msg.style.fontWeight = "bold";
    answerListElem.appendChild(msg);

    // Show the "Next Question" button
    showNextButton();
  } catch (error) {
    console.error("Error handling answer:", error);
    // Re-enable buttons in case of error
    buttons.forEach(btn => btn.disabled = false);
  }
}

/**
 * highlightAnswers:
 *  - If correct, apply .correct to the clicked button
 *  - If incorrect, apply .incorrect to the clicked button AND
 *    apply .correct to the button that actually has the question's correct answer
 */
function highlightAnswers(isCorrect, question, clickedButton) {
  // Remove any existing highlights
  const buttons = answerListElem.querySelectorAll("button");
  buttons.forEach(btn => {
    btn.classList.remove("correct", "incorrect");
  });

  if (isCorrect) {
    clickedButton.classList.add("correct");
  } else {
    clickedButton.classList.add("incorrect");
    
    // Highlight the correct answer
    buttons.forEach((btn) => {
      if (btn.textContent === question.answer) {
        btn.classList.add("correct");
      }
    });
  }
}

/**
 * Shows a "Next Question" button so the user can proceed after seeing
 * feedback on their answer in the form of highlighted (red/green) answers.
 */
function showNextButton() {
  if (!nextButton) {
    nextButton = document.createElement("button");
    nextButton.textContent = "Next Question";
    nextButton.className = "next-button";
    nextButton.addEventListener("click", () => {
      // Remove feedback message
      const feedback = answerListElem.querySelector(".feedback");
      if (feedback) feedback.remove();
      
      // Re-enable all buttons
      const buttons = answerListElem.querySelectorAll("button");
      buttons.forEach(btn => btn.disabled = false);
      
      // Hide next button
      nextButton.style.display = "none";
      
      // Display next question
      displayNextQuestion();
    });
    answerListElem.appendChild(nextButton);
  }
  nextButton.style.display = "block";
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