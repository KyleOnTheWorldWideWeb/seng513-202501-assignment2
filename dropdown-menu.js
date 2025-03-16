/** Adds event listeners to the dropbdown-button and each dropdown-category.  */
document.addEventListener("DOMContentLoaded", function() {
    // Click event on the <dropdown-button> element calls function causing all categories to "show" on screen.
    document.getElementById("dropdown-button").addEventListener("click", toggleDropdownMenu);
    
    // Select the <dropdown-categories> element and all of its anchor <a> sub-elements (children) 
    document.querySelectorAll(".dropdown-categories a").forEach(category => {
        // In an EVENT, <this> refers to the DOM element we are attaching the event handler to
        category.addEventListener("click", function() {
            setQuizCategory(this.getAttribute("data-url"));
        });

    }) // end of query
}); // end of <DOMContentLoaded> event listener

// For storing the quiz category the user has selected.
let userSelectedCategoryURL = "";

/**  */
function setQuizCategory(url) {
    userSelectedCategoryURL = url;
    console.log("Selected Quiz API URL:", userSelectedCategoryURL);
    // Hide dropdown after selecting
    document.getElementById("dropdown-menu").classList.remove("show");
}

function toggleDropdownMenu() {
    // console.log("Dropdown button clicked!");
    // let menu = document.getElementById("dropdown-menu");
    // console.log("Menu:", menu);
    // console.log("Before Toggle:", menu.classList); // Check existing classes
    // menu.classList.toggle("show");
    // console.log("After Toggle:", menu.classList); // Should include "show"
    
    // Adds the <show> class to the <dropdown-menu> HTML element
    // CSS styling for the <show> class is set to <block> so that the content will appear on screen.
    document.getElementById("dropdown-menu").classList.toggle("show");
}



// Hides the dropdown menu when the user selects a category or clicks outside the initial menu bar.
// window.onclick = function(event) {
//     // Triggers if the user clicks anywhere other than droppdown button.
//     if (!event.target.matches('.dropdown-button')) {
//         let dropdownMenu = document.getElementById("dropdown-menu");
//         if (dropdownMenu.classList.contains("show")) {
//             dropdownMenu.classList.remove("show");
//         }
//         // let dropdownCategories = document.getElementsByClassName("dropdown-categories");
//         // // Iterate through each quiz category element
//         // for (let i = 0; i < dropdownCategories.length; i++) {
//         //     // Check to see if the element contains the <show> class (i.e. it is shown on screen)
//         //     if (dropdownCategories[i].classList.contains("show")) {
//         //         // Removes the <show> class - i.e. "hides" the element
//         //         dropdownCategories[i].classList.remove("show");
//         //     }
//         // }
//     }
// }

