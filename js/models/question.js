export class Question {
    constructor(text, choices, answer, difficulty) {
      this.text = text;
      this.choices = choices;
      this.answer = answer;
      this.difficulty = difficulty;
    }
    
    // We should consider using addEventListener for each question.
    checkAnswer(choice) {
      const isCorrect = choice === this.answer;
      const feedback = isCorrect ? 
        `Correct! Well done!` : 
        `Incorrect. The correct answer was: ${this.answer}`;
      
      return {
        isCorrect,
        feedback,
        score: isCorrect ? this.getScore() : -1
      };
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