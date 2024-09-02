/* 
 * David Sanchez
 * Newcastle University
 * 
 * 2023 April 25: Created
 * 
 * This object is used to store a scenario.
 * 
 * I have decided to keep using ES5 class declaration instead of ES6(ECMAScript2015) 
 * ""var className=function()"" rather than class className{constructor}"
 * because this Class does not behave like a Java class and it is confusing. 
 * 
 * This is a full prototype class because I need a very fast performance and 
 * I do not care about private modifications of data.
 * (Private members Through closures-Pro JavaScript Design Pattersn, p.33)
 * Placing inside the constructor private variables and using scope: 
 * https://www.sitepoint.com/object-oriented-javascript-deep-dive-es6-classes/)
 * Private methods have to me simulated in Javascript and it is no better
 * that what I already did
 * https://exploringjs.com/es6/ch_classes.html
 * 
 */





/**
 * This is a scenario object.
 * 
 * I decided to use an object because it would be easier to document
 * the scenarios parameters. 
 * 
 *  * ProbablityRandomBrakeUniform
 *   This value models the probability of braking, also known as p.
 *   p=0 means there are no probability of braking, p=1 means that will be
 *   braking.
 *   This parameter is used when there is a single value for the whole road. 
 * 
 *  * ProbabilityRandomBrakeMultiple
 *   This saves the value of a radio button that indicates if the simulation
 *   uses uniform value or multiple values. I am saving just multiple values
 *   since unifor is the opposite. 
 * 
 * 
 * * ProbablityRandomBrakeArray
 *   This is an array of values or probability of braking, also known as p.
 *   p=0 means there are no probability of braking, p=1 means that will be
 *   braking.
 *   This parameter is used when there are different p for each cell on the 
 *   road.
 * 
 * * numberOfHackedMovables:
 *   This is the amount of vehicles that are hacked in the scenario.
 * 
 * * numberOfRepetitions:
 *   This value specifies what is the amount of repetitions that this scenario
 *   has. For a real time, it should be 1.
 * 
 */

class Scenario {



    /**
     *
     * @param {float} probabilityRandomBrakeUniform
     * @param {Boolean} probabilityRandomBrakeMultiple,
     * @param {Array} probabilityRandomBrakeArray,
     * @param {int} numberOfHackedMovables 
     * @param {int} numberOfRepetitions 
     */
    constructor(
        probabilityRandomBrakeUniform,
        probabilityRandomBrakeMultiple,
        probabilityRandomBrakeArray,
        numberOfHackedMovables,
        numberOfRepetitions) {





        // ========================================================================== //
        // Privileged attributes

        this.sensor = new Sensor(
            probabilityRandomBrakeUniform,
            probabilityRandomBrakeMultiple,
            probabilityRandomBrakeArray);
            
        this.numberOfHackedMovables = numberOfHackedMovables;
        this.numberOfRepetitions = numberOfRepetitions
    }







    // ========================================================================== //
    // Public methods (Prototype methods)





}