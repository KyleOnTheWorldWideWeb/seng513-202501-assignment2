export class User {
    constructor(name, scoreHistory = []) {
      this.name = name;
      this.scoreHistory = scoreHistory;
    }
  
    insertScore(points) {
      this.scoreHistory.push(points); 
    }
}