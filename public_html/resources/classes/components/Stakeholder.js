/* 
 * David Sanchez
 * Newcastle University
 * 
 * 2022 Mar 21: Created
 * This decider is based on the a NaSch emergent microscopic 
 * simulator.
 * 
 * I have decided to use class declaration ES6(ECMAScript2015)
 * class className{constructor}" instead of ""var className=function()""
 * because I need to make good use of memory and it is not important to have
 * private variables. 
 * Class methods are added to the prototype so they are shared across objects.
 * The amounts of vehicles can be high so I need to share methods to reduce 
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
 * This stakeholder has a NaSch decider. 
 * It has the rules and methods to decide what do do given distance
 * to the next movable and actual speed.
 * It follows the rules determined by NaSch [Nagel1992ACA]
 * However, I found out that the rules were better explained in
 * Poore [poore2006emergent]
 * 
 * 
 * e.g.
 * # (number) is the speed of a movable commodity (vehicle) 
 * M occupies a block when travelling from one block to another
 * M departs from A and final destination is B
 * A and B are nodes.
 * 
 * 4....3....5....0......1.....0.....5.....5  
 * A---------------------------------------B 
 * 
 */

class Stakeholder {



    /**
     * This creates a Stakeholder that decides how to drive a movable.
     * 
     * Rules are taken fron the NaSch simulator
     * 
     */
    constructor(velocityMax, sensor) {





        // ========================================================================== //
        // Privileged attributes
        this.velocity;







        // ========================================================================== //
        // Private attributes

        //Private by convention, not really private by Javascript
        this._velocityMax = velocityMax;
        this._sensor = sensor;




        // ========================================================================== //
        // Private methods





        // ========================================================================== //
        // Privileged methods





    }





    // ========================================================================== //
    // Public methods (Prototype methods)





    /**
     * Rule 1 of NasCh simulator
     * This accelerates the movable
     * 
     * @param {Integer} nextVehicleDistance 
     */
    accelerate(nextVehicleDistance) {

        //According to Poore [poore2006emergent]
        //According to Schadschneider [SCHADSCHNEIDER2002153]
        if (this.velocity < this._velocityMax) {
            this.velocity = Math.min(this.velocity + 1, this._velocityMax);
        }

        // //According to NaSch [Nagel1992ACA]
        // if ((this.velocity < this._velocityMax) &&
        //     (nextVehicleDistance > (this.velocity + 1))) {
        //     this.velocity++;
        // }
    }






    /**
     * Rule 2 of NasCh simulator
     * This desaccelerates the movable
     * 
     * @param {Integer} nextVehiclePosition 
     */
    decelerate(nextVehicleDistance) {

        //According to Poore [poore2006emergent]
        if (nextVehicleDistance <= this.velocity) {
            nextVehicleDistance = (nextVehicleDistance > 0) ? nextVehicleDistance - 1 : 0;
            this.velocity = Math.min(this.velocity, nextVehicleDistance);
        }


        // //According to NaSch [Nagel1992ACA]
        // if ((this.velocity > 0) && (nextVehicleDistance <= this.velocity)) {
        //     this.velocity = nextVehicleDistance-1;
        // }
    }





    /**
     * Rule 3 of NasCh simulator
     * This reduces the speed of the vehicle according to a random value
     * with probability
     * 
     *  Taken from:
     * https://stackoverflow.com/questions/8877249/generate-random-integers-with-probabilities
     */
    randomise(currentCell) {




        const probabilityRandomBrake = this._sensor.getNextReading(currentCell, this.velocity);

        const randomNumber = Math.random();


        //According to Poore [poore2006emergent]
        if (this.velocity > 0 && (randomNumber < probabilityRandomBrake)) {
            this.velocity = Math.max(this.velocity - 1, 0);
        }


        // //According to NaSch [Nagel1992ACA]
        // if (this.velocity > 0 && (Math.random() < this._probability)) {
        //     this.velocity = this.velocity - 1;
        // }
    }





    /**
     * This method decides what do with the vehicle, receives distance to the next 
     * vehicle as parameter and return the new position of the vehicle.
     * 
     * @param {int} nextVehicleDistance 
     * @param {int} velocity
     * @param {int} currentCell
     * @returns this.x new poisition
     */

    decide(nextVehicleDistance, velocity, currentCell) {


        this.velocity = velocity;

        this.accelerate(nextVehicleDistance);
        this.decelerate(nextVehicleDistance);
        this.randomise(currentCell);

        const answer = {
            "velocity": this.velocity
        };

        return answer;
    }





}