import { User } from "./user.js";
import { Quiz, Question } from "./quiz.js";
// Assign all functions defined in questionGenerator.js to the QuestionGenerator (QG) namespace
import { questionGenerator } from "./question-generator.js";

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
  console.log(`Initializing quiz for ${user.name} with API: ${categoryURL}`);

  try {
    // Create a new Quiz instance
    quiz = new Quiz(user, categoryURL);

    // Create a generator to manage the flow of quiz questions
    gen = questionGenerator(quiz);

    console.log(gen.question);

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
  // Show question text
  questionElem.textContent = question.text;

  // Clear existing answers in the list
  answerListElem.innerHTML = "";

  // Create a button for each choice
  question.choices.forEach((choice) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = choice;

    btn.setAttribute("data-answer", question.answer); // Store the correct answer

    // On click, we pass the chosen answer to handleAnswer
    btn.addEventListener("click", () => handleAnswer(choice, btn, question));

    li.appendChild(btn);
    answerListElem.appendChild(li);
  });
}

// /**
//  * Called when the user selects an answer:
//  * 1. Resume the generator with user’s choice -> gen.next(choice).
//  * 2. The generator yields an object: { question, isCorrect }.
//  * 3. We highlight buttons and show feedback.
//  */
function handleAnswer(choice, clickedButton, question) {
  console.log("Answer clicked:", choice);
  // Resume generator to check correctness (this yields { question, isCorrect })
  const { value, done } = gen.next(choice);

  if (done) {
    // Generator has ended — no more questions
    displayFinishedState();
    return;
  }

  console.log("Answer clicked:", value);

  // value should be { question, isCorrect }
  const { isCorrect } = value;

  // Highlight the correct / incorrect button(s)
  highlightAnswers(isCorrect, question, clickedButton);

  // Show a message on the page about correctness
  const msg = document.createElement("p");
  if (isCorrect) {
    msg.textContent = "You're correct!";
  } else {
    msg.textContent = "Sorry, you chose the wrong answer.";
  }
  answerListElem.appendChild(msg);

  // Now show the "Next Question" button (if not already there)
  // so the user can proceed at their own pace.
  showNextButton();
}

// /**
//  * highlightAnswers:
//  *  - If correct, apply .correct to the clicked button
//  *  - If incorrect, apply .incorrect to the clicked button AND
//  *    apply .correct to the button that actually has the question's correct answer
//  */
function highlightAnswers(isCorrect, question, clickedButton) {
  if (isCorrect) {
    // Mark the clicked button as correct
    clickedButton.classList.add("correct");
  } else {
    // Mark the clicked button as incorrect
    clickedButton.classList.add("incorrect");

    // Also highlight the correct answer
    // We can find the correct button by scanning answerListElem
    const buttons = answerListElem.querySelectorAll("button");
    buttons.forEach((btn) => {
      if (btn.textContent === question.answer) {
        btn.classList.add("correct");
      }
    });
  }
}

// /**
//  * Shows a "Next Question" button so the user can proceed after seeing
//  * feedback on their answer in the form of highlighted (red/green) answers.
//  */
function showNextButton() {
  if (!nextButton) {
    nextButton = document.createElement("button");
    nextButton.textContent = "Next Question";
    nextButton.addEventListener("click", displayNextQuestion);
    answerListElem.appendChild(nextButton);
  } else {
    nextButton.style.display = "inline-block";
  }
}

// /**
//  * Hide the Next button every time a new question is displayed.
//  */
// function hideNextButton() {
//   if (nextButton) {
//     nextButton.style.display = "none";
//   }
// }

// /**
//  * Display a "quiz finished" message when the generator is done.
//  */
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
