import { Quiz, Question } from './quiz.js';


/**
 * Generator function to manage the flow of quiz questions.
 * It dynamically adjusts difficulty and retrieves new questions if needed.
 * @param {Quiz} quiz - The current quiz instance.
 */
// Had to change it to async because otherwise <yield* fetchQuestions(quiz)> will 
// trigger an "Uncaught TypeError".
export async function* questionGenerator(quiz) {
  while (true) {
    // Adjust the quiz difficulty (e.g., after each round or based on user performance).
    quiz.difficultyAdjustment();

    // If there are no questions left in the quiz object, fetch new ones from an API.
    if (quiz.questions.length === 0) {
      console.log(`Fetching new ${quiz.difficulty} questions...`);
      // yield* delegates to another generator (fetchQuestions) to get new questions.
      yield* fetchQuestions(quiz);
    }

    // Retrieve the next question from the quiz.
    const question = quiz.retrieveQuestion();

    // If no question is returned, assume we've exhausted all possibilities and exit the generator.
    if (!question) {
      console.log("No more questions available.");
      return; // Ends the generator.
    }

    // Yield the question to the caller, which can pause here until the user provides an answer.
    const userAnswer = yield question;

    // Check whether the userAnswer is correct.
    const isCorrect = quiz.answerQuestion(userAnswer);

    // Yield feedback so the UI knows what happened
    yield { question, isCorrect };

    // Log the result of the user's answer.
    console.log(isCorrect ? "Correct answer!" : "Wrong answer!");
  }
}

  /**
 * Fetches new questions from the Open Trivia DB API and adds them to the quiz.
 * Uses async/await since fetching data is asynchronous.
 * @param {Quiz} quiz - The quiz instance to store new questions.
 */

async function* fetchQuestions(quiz) {
    try {
      // API endpoint with dynamic difficulty
      //const apiUrl = `https://opentdb.com/api.php?amount=10`;

      // ^^^ huh? There is no such thing in the API.
      // We have to change the difficulty level manually by changing the URL.
      // Which I have added to the Quiz object.
      
  
      
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      
      for (let item of data.results) {
        const formattedQuestion = new Question(
          item.question,
          [...item.incorrect_answers, item.correct_answer].sort(() => Math.random() - 0.5), // Shuffle choices
          item.correct_answer,
          quiz.difficulty
        );
  
        
        quiz.addQuestion(formattedQuestion);
  
        
        yield formattedQuestion;
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }
