/*
 * David Sanchez
 * Newcastle University. 2022
 *  
 * This code is used to support the help behaviour
 *  
 */

/**
 * This declaration is used to avoid warnings.
 * preferences will be resolved at runtime when preferences.js is executed
 * 
 * @type type
 */
var preferences;

/**
 * This function hndles the opening of tabs
 * 
 * @param {type} evt
 * @param {type} tabName
 * @returns {undefined}
 */
var openTab = function (evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    if (tabName === 'Operation') {
        // Get the element with id="defaultOpen" and click on it
        document.getElementById("defaultSubTabOpen").click();
    }
};

/**
 * This function handles the opening of subtabs
 * 
 * @param {type} evt
 * @param {type} tabName
 * @returns {undefined}
 */
var openSubTab = function (evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("subTabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("subTablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

};



// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();