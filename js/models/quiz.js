export class Quiz {
  constructor(user, apiURL) {
    this.apiURL = apiURL;
    this.score = 0;
    this.difficulty = "easy";
    this.questions = [];
    this.user = user;
    this.currentQuestion = null;
  }

  difficultyAdjustment() {
    let newDifficulty = this.score < 3 ? "easy" : this.score < 4 ? "medium" : "hard";
    console.log(`Current Difficulty: ${this.difficulty}, New Difficulty: ${newDifficulty}`);
    this.difficulty = newDifficulty;
    if (/difficulty=\w+/.test(this.apiURL)) {
      this.apiURL = this.apiURL.replace(/difficulty=\w+/, `difficulty=${newDifficulty}`);
    } else {
      this.apiURL += `&difficulty=${newDifficulty}`;
    }

    console.log(`Updated Difficulty: ${this.difficulty}`);
    console.log(`Updated API URL: ${this.apiURL}`);
  }

  addQuestion(question) {
    this.questions.push(question);
  }

//   getNextQuestion() {
//     if (this.questions.length === 0) {
//         console.error("No more questions available.");
//         return null;
//     }

//     //ENSURE WE HOLD THE QUESTION BEFORE SHIFTING THE ARRAY
//     if (!this.currentQuestion) {
//         this.currentQuestion = this.questions[0];  // Hold reference to first question
//     }

//     console.log("Next question set:", this.currentQuestion.text);
//     return this.currentQuestion;
// }

getNextQuestion() {
  if (this.questions.length === 0) {
    console.error("No more questions available.");
    return null;
  }
  this.currentQuestion = this.questions.pop(); // Hold reference to first question
  console.log("Next question set:", this.currentQuestion.text);
  return this.currentQuestion;
}



answerQuestion(choice) {
  if (!this.currentQuestion) {
      console.error("ERROR: Trying to answer but `this.currentQuestion` is null.");
      return { isCorrect: false, feedback: "Error: No active question found. Please try again." };
  }

  const isCorrect = choice === this.currentQuestion.answer;
  const feedback = isCorrect
      ? "Correct answer!"
      : `Incorrect. The correct answer is ${this.currentQuestion.answer}.`;

  if (isCorrect) {
      this.score++;
      console.log("User answered correctly! The score is now:", this.score);
      this.difficultyAdjustment();
  }

  console.log(`${this.user.name} current score: ${this.score}`);

  // DO NOT clear `this.currentQuestion` yet—let the generator handle it
  return { isCorrect, feedback };
}


  finishQuiz() {
    this.user.insertScore(this.score);
    return this.score;
  }
}