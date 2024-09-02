/* 
 * David Sanchez
 * Newcastle University
 * 
 * 2022 Mar 21: Created
 * This movable is a small structure to be used in a NaSch emergent microscopic 
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
 * This is a movable. 
 * movable represents cars that can travel thorugh an array.
 * A normal NaSch implementation does not use so many layers and objects.
 * I am using them because I want to track movables.
 * 
 * e.g.
 * # (number) is the speed of a movable commodity (movable) 
 * M occupies a block when travelling from one block to another
 * M departs from A and final destination is B
 * A and B are nodes.
 * 
 * 4....3....5....0......1.....0.....5.....5  
 * A---------------------------------------B 
 * 
 */

class Movable {



    /**
     * This creates a movable.
     * It saves in x the specified initial position
     * 
     * @param {int} id 
     * @param {int} x 
     * @param {Stakeholder} stakeholder 
     * @param {["clear","hacked"]} kind 
     */
    constructor(id, x, stakeholder, kind) {





        // ========================================================================== //
        // Privileged attributes
        this.id = id;
        this.x = x;
        this.y = 0;
        this.stakeholder = stakeholder;
        this.kind = kind;
        this.velocity = 0;
        this.colour;





        // ========================================================================== //
        // Private attributes

        //Private by convention, not really private by Javascript
        this._probability = 0.1;
        this._velocityMax = 5;





        // ========================================================================== //
        // Private methods





        // ========================================================================== //
        // Privileged methods





        //Sets the colour
        this.setColour();
    }





    // ========================================================================== //
    // Public methods (Prototype methods)





    /**
     * Sets a stakeholder for the movable
     * 
     * This method is used to override the constructor stakeholder when the 
     * movable is hacked.
     * 
     * @param {Stakeholder} stakeholder 
     */
    setStakeholder(stakeholder) {
        this.stakeholder = stakeholder;
    }





    /**
     * Sets a stakeholder for the movable
     * 
     * This method is used to override the stakeholder kind when the 
     * movable is hacked.
     * 
     * @param {Stakeholder} stakeholder 
     */
    setKind(kind) {
        this.kind = kind;
    }





    /**
     * This function produces colours based on HSV 
     * https://en.wikipedia.org/wiki/HSL_and_HSV
     * 
     * The higher the value, the colour will be softer.
     * For example, 220 will produce pastel colours.
     * 
     * A lower value will produce more vibrants colours
     * 
     * Taken from: https://stackoverflow.com/questions/1152024/best-way-to-generate-a-random-color-in-javascript#1152508
     * Author: David Mihal
     * @param {Integer} brightness 
     * @returns 
     */
    randomColour(brightness) {
        function randomChannel(brightness) {
            var r = 255 - brightness;
            var n = 0 | ((Math.random() * r) + brightness);
            var s = n.toString(16);
            return (s.length == 1) ? '0' + s : s;
        }
        return '#' + randomChannel(brightness) + randomChannel(brightness) + randomChannel(brightness);
    }





    /**
     * This colours the movable
     * 
     */
    setColour() {

        if (this.kind === "hacked") {
            //If the movable is hacked, change it to full bright red
            this.colour = "#ff0000";

        } else {
            //Get a random pastel colour
            // this.colour = this.randomColour(170);
            this.colour = this.randomColour(50);
        }
    }





    /**
     * This advances the movable to a new position according to velocity
     * 
     */
    reposition() {
        this.x = this.x + this.velocity;
    }





    /**
     * This method decides what do with the movable, receives distance to the next 
     * movable as parameter and return the new position of the movable.
     * 
     * @param {int} nextmovableDistance 
     * @param {int} currentCell 
     * @returns movable
     */
    stakeholderDecide(nextmovableDistance, currentCell) {

        let myAnswer = this.stakeholder.decide(nextmovableDistance, this.velocity, currentCell);

        this.velocity = myAnswer.velocity;
        this.reposition();
    }





}