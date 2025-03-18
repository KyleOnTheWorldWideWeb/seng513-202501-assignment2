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
    let newDifficulty = this.score < 10 ? "easy" : this.score < 20 ? "medium" : "hard";
  
    this.difficulty = newDifficulty;
    if (/difficulty=\w+/.test(this.apiURL)) {
      this.apiURL = this.apiURL.replace(/difficulty=\w+/, `difficulty=${newDifficulty}`);
    } else {
      this.apiURL += `&difficulty=${newDifficulty}`;
    }
  
    console.log(`Updated Difficulty: ${this.difficulty}`);
    console.log(`Updated API URL: ${this.apiURL}`);
  }

  // TODO: Handle adding of questions from the api call to the url:
  // huh? I thought question generation was handled by the question generator. 

  addQuestion(question) {
    this.questions.push(question);
  }
  
  // TODO: Handle how we add questions in and when we want to end.
  async getNextQuestion() {
    if (!this.generator) {
      console.warn("Question generator not initialized!");
      return null;
    }
  
    const next = await this.generator.next();
    if (next.done) {
      return null;
    }
  
    return next.value;
  }
  // I think this will need to be changed. Currently it updates a users score
  // then returns false if the answer was wrong and true if it was correct.
  answerQuestion(choice) {
    if (!this.currentQuestion) {
      return { isCorrect: false, feedback: "Quiz completed" };
    }
    
    const result = this.currentQuestion.checkAnswer(choice);
    this.score = Math.max(0, this.score + result.score);
    console.log(`${this.user.name} current score is: ${this.score}`);
    return result;
  }

  finishQuiz() {
    this.user.insertScore(this.score);
    return this.score;
  }
}