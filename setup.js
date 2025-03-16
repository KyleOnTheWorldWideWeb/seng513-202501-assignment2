import { userSelectedCategoryURL } from './setup.js'; 
import { startQuiz } from './main.js';
import { User } from './user.js';



/* For storing the quiz category the user has selected.
*  Exporting it will allow an module that imports it to access the value.
*  Using modules in this way is known as "live binding" - any changes to 
*  the value in one module will be reflected in any other module that imports it.
*/
let userSelectedCategoryURL = "";

document.addEventListener("DOMContentLoaded", function() {

    // Click event on the <dropdown-button> element calls function causing all categories to "show" on screen.
    document.getElementById("dropdown-button").addEventListener("click", toggleDropdownMenu);
    
    // Select the <dropdown-categories> element and all of its anchor <a> sub-elements (children) 
    document.querySelectorAll(".dropdown-categories a").forEach(category => {
        // In an EVENT, <this> refers to the DOM element we are attaching the event handler to
        category.addEventListener("click", function() {
            setQuizCategory(this.getAttribute("data-url"));
        });

    }) 

    const userNameInput = document.getElementById("username");
    const startButton = document.getElementById("start-button");

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

        console.log(`Starting quiz for ${userName} in category: ${userSelectedCategoryURL}`);

        // Create User instance
        const user = new User(userName);

        /* Start the quiz by passing the user and selected category
        * We want to pass the url by value because the value of userSelectedCategoryURL will change if the user
        * selects a different category using the dropdown menu. This would be BAD if it happened mid quiz because
        * the quiz would then be based on a different category than the one the user started with.
        */
        startQuiz(user, userSelectedCategoryURL);
    });
}); // end of <DOMContentLoaded> event listener


function setQuizCategory(url) {
    userSelectedCategoryURL = url;
    console.log("Selected Quiz API URL:", userSelectedCategoryURL);
    // Display the selected category in the dropdown button
    document.getElementById("dropdown-button").textContent = document.querySelector(`a[data-url="${url}"]`).textContent;
    // Hide dropdown after selecting
    document.getElementById("dropdown-menu").classList.remove("show");
}

function toggleDropdownMenu() {
    // Adds the <show> class to the <dropdown-menu> HTML element
    // CSS styling for the <show> class is set to <block> so that the content will appear on screen.
    document.getElementById("dropdown-menu").classList.toggle("show");
}



