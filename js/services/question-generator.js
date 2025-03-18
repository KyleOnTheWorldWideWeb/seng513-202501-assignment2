import { Quiz, Question } from '../models/quiz.js';

/**
 * Generator function to manage the flow of quiz questions.
 * It dynamically adjusts difficulty and retrieves new questions if needed.
 * @param {Quiz} quiz - The current quiz instance.
 */
export async function* questionGenerator(quiz) {
  while (true) {
    try {
      // Adjust the quiz difficulty based on score
      quiz.difficultyAdjustment();

      // If there are no questions left, fetch new ones
      if (quiz.questions.length === 0) {
        console.log(`Fetching new ${quiz.difficulty} questions...`);
        yield* fetchQuestions(quiz);
      }

      // Get the next question
      const question = quiz.getNextQuestion();
      if (!question) {
        console.log("No more questions available.");
        return;
      }

      // Yield the question and wait for answer
      const userAnswer = yield question;

      if (!userAnswer) {
        console.error("No answer received from user");
        continue;
      }

      // Process the answer and yield the result
      const result = quiz.answerQuestion(userAnswer);
      yield result;

      console.log(result.isCorrect ? "Correct answer!" : "Wrong answer!");
    } catch (error) {
      console.error("Error in question generator:", error);
      yield { isCorrect: false, feedback: "An error occurred while processing your answer." };
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
    yield { error: true, message: "Failed to fetch questions. Please try again." };
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
