import { questionGenerator } from './question-generator.js';
 // Must import the User class so we don't get a ReferenceError at runtime
import { User } from './user.js';
// Needed to get the API url chosen in the dropdown menu
import { userSelectedCategoryURL } from './setup.js'; 


export class Question {
  constructor(text, choices, answer, difficulty) {
    this.text = text;
    this.choices = choices;
    this.answer = answer;
    this.difficulty = difficulty;
  }
  // We should consider using addEventListener for each question.
  checkAnswer(choice) {
    if (choice === this.answer) {
      console.log(`Question '${this.text}' choice '${choice}' is correct`);
      return this.getScore();
    } else {
      console.log(`Question '${this.text}' choice '${choice}' is wrong`);
      return -1;
    }
  }
  getScore() {
    switch (this.difficulty) {
      case "medium":
        return 2;
      case "hard":
        return 3;
      default:
        return 1;
    }
  }
}

export class Quiz {
  constructor(user, apiURL) {
    // Users can select a category from the dropdown menu
    // The selected category URL is passed to the Quiz constructor
    this.apiURL = apiURL;
    this.score = 0;
    this.difficulty = "easy"; 
    this.questions = [];
    this.user = user;
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
  // 

  addQuestion(question) {
    this.questions.push(question);
  }
  // TODO: Handle how we add questions in and when we want to end.
  retrieveQuestion() {
    if (this.questions.length !== 0) {
      const question = this.questions[this.questions.length - 1];
      this.questions.pop(); 
      return question;
    } else {
      return null;
    }
  }
  // I think this will need to be changed. Currently it updates a users score
  // then returns false if the answer was wrong and true if it was correct.
  answerQuestion(choice) {
    const question = this.retrieveQuestion();
    if (!question) {
      console.log("No more questions available.");
      return false;
    }
    const points = question.checkAnswer(choice);
    this.score += points;
    console.log(`${this.user.name} current score is: ${this.score}`);
    return points !== -1;
  }

  finishQuiz() {
    this.user.insertScore(this.score);
    return this.score;
  }
}



