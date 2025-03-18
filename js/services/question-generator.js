import { Quiz, Question } from '../models/quiz.js';

/**
 * Generator function to manage the flow of quiz questions.
 * Dynamically adjusts difficulty and fetches new questions when needed.
 * @param {Quiz} quiz - The current quiz instance.
 */
export async function* questionGenerator(quiz) {
  while (true) {
    try {
      // Adjust the quiz difficulty based on the score
      quiz.difficultyAdjustment();

      // If no questions exist, fetch new ones
      if (quiz.questions.length === 0) {
        console.log(`Fetching new ${quiz.difficulty} questions...`);
        
        // Corrected: Await questions properly before proceeding
        for await (const question of fetchQuestions(quiz)) {
          yield question; // Yield each fetched question
        }

        if (quiz.questions.length === 0) {
          console.log("Failed to fetch new questions.");
          return; // Stop the generator if no questions were added
        }
      }

      // Get and yield the next question
      const question = quiz.getNextQuestion();
      if (!question) {
        console.log("No more questions available.");
        return;
      }

      const userAnswer = yield question; // Wait for user input

      if (!userAnswer) {
        console.error("No answer received from user");
        continue;
      }

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

    let fetchedQuestions = 0;

    for (let item of data.results) {
      const formattedQuestion = new Question(
        item.question,
        shuffleArray([...item.incorrect_answers, item.correct_answer]),
        item.correct_answer,
        quiz.difficulty
      );

      quiz.addQuestion(formattedQuestion);
      fetchedQuestions++;
      yield formattedQuestion; // Yield each fetched question
    }

    if (fetchedQuestions === 0) {
      console.warn("No valid questions received from API.");
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
