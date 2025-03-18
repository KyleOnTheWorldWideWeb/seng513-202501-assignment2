import { User } from "./models/user.js";
import { startQuiz } from "./main.js";

// For storing the quiz category the user has selected.
let userSelectedCategoryURL = "";

document.addEventListener("DOMContentLoaded", function () {
  // Click event on the <dropdown-button> element to toggle the dropdown menu
  const dropdownButton = document.getElementById("dropdown-button");
  dropdownButton.addEventListener("click", toggleDropdownMenu);

  // Select all category links in the dropdown menu
  const categoryLinks = document.querySelectorAll(".dropdown-categories a");
  categoryLinks.forEach((category) => {
    category.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default link behavior
      setQuizCategory(this.getAttribute("data-url"));
    });
  });

  // Start button logic
  const startButton = document.getElementById("start-button");
  const userNameInput = document.getElementById("username");

  startButton.addEventListener("click", function () {
    const userName = userNameInput.value.trim();

    if (userName === "") {
      alert("Please enter your name to start the quiz.");
      return;
    }

    if (!userSelectedCategoryURL) {
      alert("Please select a quiz category.");
      return;
    }

    // Create User instance
    const user = new User(userName, []);

    // Start the quiz
    startQuiz(user, userSelectedCategoryURL);
  });
});

/**
 * Sets the selected quiz category and updates the dropdown button text.
 * @param {string} url - The API URL for the selected category.
 */
function setQuizCategory(url) {
  userSelectedCategoryURL = url;

  // Update the dropdown button text to show the selected category
  const selectedCategory = document.querySelector(`a[data-url="${url}"]`).textContent;
  document.getElementById("dropdown-button").textContent = selectedCategory;

  // Hide the dropdown menu after selection
  document.getElementById("dropdown-menu").classList.remove("show");
}

/**
 * Toggles the visibility of the dropdown menu.
 */
function toggleDropdownMenu() {
  const dropdownMenu = document.getElementById("dropdown-menu");
  dropdownMenu.classList.toggle("show");
}