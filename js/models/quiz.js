export class Quiz {
  constructor(user, apiURL) {
    // Users can select a category from the dropdown menu
    // The selected category URL is passed to the Quiz constructor
    this.apiURL = apiURL;
    this.score = 0;
    this.difficulty = "easy"; 
    this.questions = [];
    this.user = user;
    this.currentQuestion = null;
  }

  difficultyAdjustment() {
    let newDifficulty;

    if (this.score < 10) {
      newDifficulty = "easy";
    } else if (this.score >= 10 && this.score < 20) {
      newDifficulty = "medium";
    } else {
      newDifficulty = "hard";
    }
    // Update the difficulty level of the quiz object
    this.difficulty = newDifficulty;
    // Update the API URL with the new difficulty using regex
    this.apiURL = this.apiURL.replace(/difficulty=\w+/, `difficulty=${newDifficulty}`);

    console.log(`Updated Difficulty: ${this.difficulty}`);
    console.log(`Updated API URL: ${this.apiURL}`);
  }

  // TODO: Handle adding of questions from the api call to the url:
  // huh? I thought question generation was handled by the question generator. 

  addQuestion(question) {
    this.questions.push(question);
  }
  
  // TODO: Handle how we add questions in and when we want to end.
  getNextQuestion() {
    if (this.questions.length === 0) {
      return null;
    }
    this.currentQuestion = this.questions.pop();
    return this.currentQuestion;
  }
  
  // I think this will need to be changed. Currently it updates a users score
  // then returns false if the answer was wrong and true if it was correct.
  answerQuestion(choice) {
    if (!this.currentQuestion) {
      return { isCorrect: false, feedback: "Quiz completed" };
    }
    
    const result = this.currentQuestion.checkAnswer(choice);
    this.score += result.score;
    console.log(`${this.user.name} current score is: ${this.score}`);
    return result;
  }

  finishQuiz() {
    this.user.insertScore(this.score);
    return this.score;
  }
}