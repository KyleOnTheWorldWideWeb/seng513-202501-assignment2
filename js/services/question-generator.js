import { Quiz } from '../models/quiz.js';
import { Question } from '../models/question.js';

/**
 * Generator function to manage the flow of quiz questions.
 * Dynamically adjusts difficulty and fetches new questions when needed.
 * @param {Quiz} quiz - The current quiz instance.
 */
export async function* questionGenerator(quiz) {
  let correctAnswers = 0;
  let totalQuestionsAsked = 0;
  let prevDifficulty = quiz.difficulty; // Track difficulty across iterations

  console.log("Quiz started. Fetching questions...");

  while (true) {
    try {
      console.log("--- NEW LOOP ITERATION ---");
      console.log(`Current Correct Answers: ${correctAnswers}`);

      // If no questions are left or the difficulty has changed, we must fetch new ones
      // The difficulty change is based on the user's score
      // The URL is updated with the new difficulty level automatically in the Quiz class
      // The URL retains the correct category but updates the difficulty
      if (quiz.questions.length === 0 || prevDifficulty !== quiz.difficulty) {
        console.log(`Fetching new questions with ${quiz.difficulty} difficulty`);
        
        quiz.questions = [];          // Clear old questions
        prevDifficulty = quiz.difficulty; // Store updated difficulty

        let hasNewQuestions = false;  

        // Retrieve new questions asynchronously
        for await (const question of fetchQuestions(quiz)) {
          hasNewQuestions = true;
        }

        if (!hasNewQuestions) {
          console.error("No new questions fetched. Ending quiz.");
          yield { type: "completion", message: "No more questions available." };
          return;
        }
      }

      // Get the next question from the stored question list
      const question = quiz.getNextQuestion();
      if (!question) {
        console.log("No more questions available after fetch. Ending quiz.");
        yield { type: "completion", message: "Quiz Completed!" };
        return;
      }

      quiz.currentQuestion = question;
      console.log("Yielding next question:", question.text);

      // MUST YIELD THE QUESTION ONLY ONCE
      const userAnswer = yield { type: "question", question };
      totalQuestionsAsked++;

      if (!userAnswer) {
        console.error("No answer received from user");
        continue;
      }

      console.log("User answered:", userAnswer);
      const result = quiz.answerQuestion(userAnswer);
      console.log("Answer result:", result);
      yield { type: "feedback", ...result };

      if (result.isCorrect) {
        correctAnswers++;
      }

      console.log(`Correct Answers: ${correctAnswers} / 7`);

      if (correctAnswers >= 7) {
        console.log("Generator ending: Quiz Completed!");
        yield { type: "completion", message: "Quiz Completed!" };
        return;
      }

      // Instead of ending the fetch loop, we need to go back and check if we need new questions or updated difficulty
      continue;

    } catch (error) {
      console.error("Error in question generator:", error);
      yield { type: "feedback", isCorrect: false, feedback: "An error occurred while processing your answer." };
    }
  }
}



/**
 * Fetches new questions from the Open Trivia DB API and adds them to the quiz.
 * @param {Quiz} quiz - The quiz instance to store new questions.
 */
async function* fetchQuestions(quiz) {
  try {
    const response = await fetch(quiz.apiURL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.response_code !== 0) {
      throw new Error(`API Error: Response Code ${data.response_code}`);
    }

    for (let item of data.results) {
      const formattedQuestion = new Question(
        item.question,
        shuffleArray([...item.incorrect_answers, item.correct_answer]),
        item.correct_answer,
        quiz.difficulty
      );

      quiz.addQuestion(formattedQuestion);
      yield formattedQuestion;
    }
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw new Error("Failed to fetch questions. Please try again.");
  }
}

/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} The shuffled array
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
