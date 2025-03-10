class Question {
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
      return this.getScore;
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

class Quiz {
  constructor(user) {
    this.score = 0;
    this.difficulty = "easy";
    this.questions = [];
    this.user = user;
  }

  difficultyAdjustment() {
    if (this.score < 10) {
      this.difficulty = "easy";
    } else if (this.score >= 10 && this.score < 20) {
      this.difficulty = "medium";
    } else {
      this.difficulty = "hard";
    }
  }
  // TODO: Handle adding of questions from the api call to the url:
  // - `https://opentdb.com/api.php?amount=${amount}&difficulty=${difficulty}`;

  addQuestion(question) {
    this.questions.push(question);
  }
  // TODO: Handle how we add questions in and when we want to end.
  retrieveQuestion() {
    if (length(this.questions) != 0) {
      const question = this.questions.back();
      this.questions.pop();
      return question;
    } else {
      return null;
    }
  }

  // I think this will need to be changed. Currently it updates a users score
  // then returns false if the answer was wrong and true if it was correct.
  answerQuestion(choice) {
    const points = question.checkAnswer(choice);
    this.score += points;
    console.log(`${this.user.name} current score is: ${this.score}`);
    if (points == -1) {
      return false;
    } else {
      return true;
    }
  }

  finishQuiz() {
    this.user.insertScore(this.score);
    return this.score;
  }
}

class User {
  constructor(name, scoreHistory = []) {
    this.name = name;
    this.scoreHistory = scoreHistory;
  }

  insertScore(points) {
    this.scoreHistory.ins;
  }
}
