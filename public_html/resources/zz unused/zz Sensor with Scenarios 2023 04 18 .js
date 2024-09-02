/* 
 * David Sanchez
 * Newcastle University
 * 
 * 2022 Oct 24: Created
 * This sensor is a small structure to be used in a NaSch emergent microscopic 
 * simulator.
 * 
 * I have decided to use class declaration ES6(ECMAScript2015)
 * class className{constructor}" instead of ""var className=function()""
 * because I need to make good use of memory and it is not important to have
 * private variables. 
 * Class methods are added to the prototype so they are shared across objects.
 * The amounts of movables can be high so I need to share methods to reduce 
 * the footprint. 
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
 * This is a sensor. 
 * Sensor simulates the probability of braking on a road.
 * Each stakeholder has access to a sensor.
 * 
 * - I have one "sensor" structure for all movables.
 *   This saves memory and makes easier to switch scenarios.
 * 
 * - A sensor has scenarios. Each scenario is saved in a map
 * 
 * 
 * - A sensor receives as parameter the cell in which the movable is
 *   and the cell to which the movable wants to move.
 *   The sensor checks all the positions from the current cell until
 *   the destination cell and returns the highest braking probability.
 * 
 *   This tries to mimic real life behaviour.
 *   The stakeholder will try to accelerate and move the vehicle as 
 *   fast as possible. The fastest scenario will be 5 cells.
 *   If there is a poddle of water on the cell 5, the stakeholder
 *   will need to Brake according to the amount of water that he finds.
 *   This will recalculate the position he has.
 * 
 *   The main issue happens if there are two poddles on the road.
 *   e.g.
 * 
 *    p=0.1  | p=0.2 | p=0.1 | p=0.3 | p=0.1        
 *   Current |-------|-------|-------| Destination
 * 
 *   If the sensor returns the first reading, then calculation will be wrong
 *   because the software cannot do a recalculation for the second reading.
 *   As a consequence, the sensor will return the highest value to try to 
 *   produce a final result that looks like reality.
 *  
 *   Other examples:
 * 
 *   e.g. 1; returns 0.3
 * 
 *   p=0.1  | p=0.2 | p=0.1 | p=0.3 | p=0.1        
 *   Current |-------|-------|------| Destination
 * 
 * 
 * 
 *   e.g. 2; returns 0.3
 * 
 *   p=0.1  | p=0.1 | p=0.1 | p=0.3 | p=0.1          
 *   Current |-------|-------|-------| Destination
 * 
 * 
 *   e.g. 3; returns 0.1
 * 
 *   p=0.1  | p=0.1 | p=0.1 | p=0.1 | p=0.1         
 *   Current |-------|-------|-------| Destination
 * 
 * 
 */

class Sensor {



    /**
     * This creates a Sensor
     */
    constructor() {





        // ========================================================================== //
        // Privileged attributes





        //Saves which one is the curent scenario considered by the sensor
        this.currentScenario = 0;




        // ========================================================================== //
        // Private attributes
        // By convention
        this._scenarios = new Map();




        // ========================================================================== //
        // Private methods





        // ========================================================================== //
        // Privileged methods

    }





    // ========================================================================== //
    // Public methods (Prototype methods)





    /**
     * Returns the first next sensor reading starting from the current cell
     * until the destination cell is achived.
     * 
     * The destination cell is found using velocity, considering that 
     * velocity means there will be a distance displacement.
     * 
     * It will check all the p values starting in the first reading and will
     * return the first different value that the current one that will find.
     * If there are no different values, then it will return the current p.
     * 
     * @param {integer} currentCell
     * @returns {integer} velocity 
     */
    getNextReading(currentCell, velocity) {

        const currentScenario = this._scenarios.get(this.currentScenario);

        let currentSensorReading = currentScenario.probabilityRandomBrakeUniform;
        const probabilityRandomBrakeMultiple = currentScenario.probabilityRandomBrakeMultiple;
        const probabilityRandomBrakeArray = currentScenario.probabilityRandomBrakeArray;

        if (probabilityRandomBrakeMultiple === true) {
            //Multiple probabilities of random Brake

            const destinationCell = currentCell + velocity;
            const cells = this.numberOfCells;

            currentSensorReading = probabilityRandomBrakeArray[currentCell];


            for (let i = currentCell; i < destinationCell; i++) {

                //Since this is a closed system, 
                //movables beyond the last array position are modulus located 
                //inside the array                    
                let readingCell = i % cells;

                let mySensorReading = probabilityRandomBrakeArray[readingCell];

                if (mySensorReading > currentSensorReading) {
                    currentSensorReading = mySensorReading;
                }
            }

        }

        return currentSensorReading;
    }





    /**
     * Adds a scenario to the sensor.
     * Scenarios shows different context to the simulator.
     * 
     * e.g. 
     * - Scenario 1
     * All consitions are perfect with no water on the road and
     * the probability of breaking in p=0.1
     * - Scenario 2
     * A significant amount of water, 25 mmm, is located only on one cell, 
     * therefore the probability of braking increases on that cell 
     * to p=0.992 

     * 
     * @param {integer} id 
     * @param {float} probabilityRandomBrakeUniform 
     * @param {boolean} probabilityRandomBrakeMultiple 
     * @param {Array} probabilityRandomBrakeArray 
     */
    addScenario(id,
        probabilityRandomBrakeUniform,
        probabilityRandomBrakeMultiple,
        probabilityRandomBrakeArray) {


        const myScenario = {
            probabilityRandomBrakeUniform: probabilityRandomBrakeUniform,
            probabilityRandomBrakeMultiple: probabilityRandomBrakeMultiple,
            probabilityRandomBrakeArray: probabilityRandomBrakeArray
        }

        this._scenarios.set(id, myScenario);

    }





    /**
     * This method changes the scenario in the sensor.
     * Once the currentScenario has changed, all getNextReading will use the
     * new scenario.
     * 
     * id is the key in the map object of the scenarios
     * @param {integer} id 
     */
    setScenario(id) {

        this.currentScenario = id;

    }



}