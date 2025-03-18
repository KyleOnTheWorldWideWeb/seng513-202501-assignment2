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

  console.log("Quiz started. Fetching questions...");

  while (true) {  // Infinite loop, will exit only when needed
      try {
          console.log(`--- NEW LOOP ITERATION ---`);
          console.log(`Current Correct Answers: ${correctAnswers}`);

          // Fetch new questions if needed
          if (quiz.questions.length === 0) {
              console.log(`Fetching new ${quiz.difficulty} questions...`);
              
              for await (const question of fetchQuestions(quiz)) {
                  console.log("Yielding fetched question:", question.text);
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
              }
          }

          // Fetch next question
          const question = quiz.getNextQuestion();
          
          if (!question) {
            console.log("No more questions available, fetching more...");
            yield { type: "feedback", isCorrect: false, feedback: "No more questions. Fetching more..." };
        
            // Trigger new API fetch if questions run out
            for await (const newQuestion of fetchQuestions(quiz)) {
                console.log("Fetched new question:", newQuestion.text);
                quiz.currentQuestion = newQuestion;

                yield { type: "question", question: newQuestion };
                return;
            }

            console.log("No new questions fetched. Ending quiz.");
            yield { type: "completion", message: "Quiz Completed!" };
            return;
        }

          quiz.currentQuestion = question;
          console.log("Yielding next question:", question.text);
          yield { type: "question", question };

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
