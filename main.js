import { User } from "./user.js";
// Assign all classes defined in quiz.js to the Quiz Classes (QC) namespace
import * as QC from "./quiz.js"; 
// Assign all functions defined in questionGenerator.js to the QuestionGenerator (QG) namespace 
import * as QG from "./question-generator.js"; 

// Create a user instance
const user1 = new User("Alice");

// Pass the user instance into Quiz
const quiz1 = new QC.Quiz(user1);




