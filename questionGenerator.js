/**
 * Generator function to manage the flow of quiz questions.
 * It dynamically adjusts difficulty and retrieves new questions if needed.
 * @param {Quiz} quiz - The current quiz instance.
 */

function* questionGenerator(quiz) {
    while (true) {
      quiz.difficultyAdjustment();
  

      if (quiz.questions.length === 0) {
        console.log(`Fetching new ${quiz.difficulty} questions...`);
        yield* fetchQuestions(quiz);
      }
  
      
      const question = quiz.retrieveQuestion();
      
      if (!question) {
        console.log("No more questions available.");
        return; // End the generator when all questions are exhausted
      }
  
      // Yield the question to the UI for display
      const userAnswer = yield question;
  
      
      const isCorrect = quiz.answerQuestion(userAnswer);
  
      
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
      const apiUrl = `https://opentdb.com/api.php?amount=5&difficulty=${quiz.difficulty}&type=multiple`;
  
      
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

  export { questionGenerator };