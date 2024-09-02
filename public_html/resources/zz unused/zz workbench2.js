/*
 * David Sanchez
 * Newcastle University. October 2022
 *  
 * This code is used to support the workbench page behaviour
 *  
 */





/**
 * This assigns behaviours to radio button "Uniform" in control simulations
 */
document.getElementById("controlProbabilityRandomBrakeUniform").addEventListener('click', function (event) {
    if (event.target && event.target.matches("input[type='radio']")) {

        //Enable uniform value
        document.getElementById("controlProbabilityRandomBrake").disabled = false;

        //Enable multiple value
        document.getElementById("controlProbabilityMultipleValue").style.display = "none";
    }
});





/**
 * This assigns behaviours to radio button "Uniform" in under-attack simulations
 */
document.getElementById("attackProbabilityRandomBrakeUniform").addEventListener('click', function (event) {
    if (event.target && event.target.matches("input[type='radio']")) {

        //Enable uniform value
        document.getElementById("attackProbabilityRandomBrake").disabled = false;

        //Enable multiple value
        document.getElementById("attackProbabilityMultipleValue").style.display = "none";
    }
});





/**
 * This assigns behaviours to radio button "Multiple" in control simulations
 */
document.getElementById("controlProbabilityRandomBrakeMultiple").addEventListener('click', function (event) {
    if (event.target && event.target.matches("input[type='radio']")) {

        //Disable uniform value
        document.getElementById("controlProbabilityRandomBrake").disabled = true;


        const container = document.getElementById("controlProbabilityMultipleValue");
        const numberOfCells = parseInt(document.getElementById("numberOfCells").value);
        const uniformValue = document.getElementById("controlProbabilityRandomBrake").value;
        const fieldNamePrefix = "controlProbabilityCell"
        

        //Dynamically create additional entry fields
        workbench.createMultipleProbabilityRandomBrakeInputFields(container, numberOfCells, uniformValue, fieldNamePrefix);


        //Enable multiple value
        document.getElementById("controlProbabilityMultipleValue").style.display = "block";

    }
});





/**
 * This assigns behaviours to radio button "Multiple" in under-attack simulations
 */
document.getElementById("attackProbabilityRandomBrakeMultiple").addEventListener('click', function (event) {
    if (event.target && event.target.matches("input[type='radio']")) {

        //Disable uniform value
        document.getElementById("attackProbabilityRandomBrake").disabled = true;

        const container = document.getElementById("attackProbabilityMultipleValue");
        const numberOfCells = parseInt(document.getElementById("numberOfCells").value);
        const uniformValue = document.getElementById("attackProbabilityRandomBrake").value;
        const fieldNamePrefix = "attackProbabilityCell"

        //Dynamically create additional entry fields
        workbench.createMultipleProbabilityRandomBrakeInputFields(container, numberOfCells, uniformValue, fieldNamePrefix);

        //Enable multiple value
        document.getElementById("attackProbabilityMultipleValue").style.display = "block";

    }
});

