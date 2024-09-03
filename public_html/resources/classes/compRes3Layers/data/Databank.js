/* 
 * David Sanchez
 * Newcastle University
 * 
 * 2022 April 11: Created
 * This object is used to stored the NaSch simulation results.
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
 * 2024 July 21: Created
 * 
 */





/**
 * The purpose of this structure is to have a singular entry point
 * for all the data that is produced by the workbench and the
 * simulations.
 * 
 * - Very important to consider that Javascript pases objects by reference,
 *   so passing the object may result in changes in the object if not done
 *   carefully.
 * 
 * - I use an object because it is easier to document the results. 
 * 
 * - Since the structure of the database is a tree, it is not necessary
 *   to use a database and it is easy to use a single object reference
 * 
 * The object structure is:
 * 
 * - Databank
 *  *  |------numberOfSimulations 
 *     |------Plot Maximum Y Value 
 *     |------Plot Minimum Y Value
 * *   |---link 
 *       |------link i
 *       |------link i+1
 *       |------link ...
 *       |------link n  
 *           |------(Layer 3) link name (ID)
 *           |------(Layer 3) JSON Router
 *           |
 *           |------(Layer 2) Keep loop
 *           |
 *           |------(Layer 2) Frames Number
 *           |------(Layer 2) Initial Frames to Discard
 *           |------(Layer 2) Movable Max Speed
 *           |------(Layer 2) Movable Performance High Limit
 *           |------(Layer 2) Movable Performance Low Limit
 *           |
 *           |------(Layer 2) Number of Hacked Movables
 *           |------(Layer 2) Probability Random Brake Uniform 
 *           |------(Layer 2) Probability Random Brake Multiple
 *           |------(Layer 2) probabilityRandomBrakeArray
 *           |
 *           |------(Layer 1) Number of Cells
 *           |------(Layer 1) Density Init
 *           |------(Layer 1) Density End
 *           |------(Layer 1) Density Steps
 *           |

 *           |
 *           |------regionTraces
 *           |------sensor
 *           |------simulation 
 *               |-------simulationDensities
 *                    |-------density i
 *                    |-------density i+1
 *                    |-------density ...
 *                    |-------density n 
 *                         |-------frames
 *                         |-------totalMovablessCrossedFinishLine
 *                         |-------totalMovablesCrossedFinishLinePerFrame
 *                         |-------numberOfMovables
 *                         |-------numberOfFrames
 *                         |-------averageSpeed
 *                         |-------totalResilienceMax
 *                         |-------totalResilienceMin
 * 
 * * General  Configuration
 * 
 * * NumerOfSimulations
 *   How many simulations will be done. This are iterations of the same
 *   simulation
 * 
* * Plot Maximum Y Value:
 *   This is the maximum value of the Y axis of the plots that are produced.
 *   Typically 100. This value is important because, the plotter can sometimes
 *   automatically choose a scale that is appropriate for the data that is
 *   showing but might be difficult to compare with other simulations.
 * 
 * * Plot Minimum Y Value:
 *   This is the minimum value of the Y axis of the plots that are produced.
 *   Typically 0. This value is important because, the plotter can sometimes
 *   automatically choose a scale that is appropriate for the data that is
 *   showing but might be difficult to compare with other simulations.
 * 
 * * Layer 3
 * 
 * * ID:
 *   Unmutable id for this particular link
 * * JSON Router:
 *   JSON object that saves the combination ID and divergent flow to another ID
 * 
 * * Layer 2
 * 
 * * Keep loop:
 *   True/False parameter that indicates to the simulator if the dnesity of the
 *   link has to be maintained. In order to do so, the simulator creates a
 *   circular flow of vehicles. It clones the vehicle that leaves the link
 *   and introduces it again on the beginnin of the link in order to maintain
 *   the density. While this is impossible to happen in real world scenarios, 
 *   this is a simulator.
 * 
 * * Numbers of Frames:
 *   This is the amount of "frames" that will have created. 
 *   Each frame is the equivalent of a picture of the road at a given time
 * 
 * * Initial Frames to Discard:
 *   This is the the number of frames that are not considered for the statistics.
 *   This are frames in which movables are not yet up to the scenario we want
 *   to simulate, so you can discard them. This are the frames in which vehicles
 *   are accelerating.
 * 
 * * Movable Max Speed:
 *   Max performance of the movable. In this case is 5 to make it compatible
 *   with NaSch simulators.
 * 
 * * MovablePerformacenHighLimit
 *   This value specifies the maximum value for the system to be effective.
 *   This is the resilience frontier.
 *   The maximum value should be similar to the upp er box graphics frontier
 *   when there are no adversarial events.
 * 
 * * MovablePerformanceLowLimit
 *   This value specifies what should be the minimum value for the system to 
 *   be effective. This is the resilience frontier.
 *   We established that bellow this number the system is not useful, safe
 *   ot any other consideration.
 *   This value should be related to the limits of the box graphics, but it 
 *   cannot be automatically calculated on each simulation.
 *   If the value is calculated everytime the simulation is run, it is not 
 *   possible to get something to compare to when the system is outboud.
 *   So, the way I determined this value is first running the simulation
 *   without any adversarial events, and then used that value as the minimum
 *   acceptable.
 * 
 * * numberOfHackedMovables
 *   This parameter tells how many vehicles are  having problems in decision
 *   making.
 * 
 * * ProbablityRandomBrakeUniform
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
 * * ProbablityRandomBrakeArray
 *   This is an array of values or probability of braking, also known as p.
 *   p=0 means there are no probability of braking, p=1 means that will be
 *   braking.
 *   This parameter is used when there are different p for each cell on the 
 *   road.
 * 
 * * Layer 1
 * 
 * * Numbers of Cells:
 *   This is the amount of "cells" that will have a road. 
 *   The original consideration for the NaSch model is that each cell would be
 *   about 3.5 meters long, so it would fit an average car. This consideration
 *   however, is not really important for this synthetic problem.
 * 
 * * Density Init/End/Steps:
 *   Density express how many movables commodities would be located in the road.
 *   The minimum is 0 and the maxmum should be 1. 
 *   The simulator calculates how many cars is going to place to achieve 
 *   the specified density.
 *   The software simulate many densities. 
 *   - Init is about the initial density to be simulated.
 *   - End is the final density that will be simulated.
 *   - Steps is about how many densities between the Init and End.
 * 
 * * Region Traces
 *   This saves the region that is being delimited by the simulations
 * 
 * * Sensor
 *   This is an object that has all the information regarding the simulated 
 *   sensing that happens on the cell.
 * 
 * * For each simulation:
 *
 * * Frames
 *   This is a map containing all road simulations.
 *   This is the data it will be plotted in the visuliser using different 
 *   representation techniques.
 * 
 * * totalMovablessCrossedFinishLine 
 *   This number indicates how many movables crossed the finish line, which is
 *   the last array possition of the road. This simulation is a closed circuit
 *   so it is equivalent to a Nascar race.
 * 
 * * totalMovablesCrossedFinishLinePerFrame 
 *   This number indicates how many movables crossed the finish line by frame.
 * 
 * * numberOfMovables
 *   The amount of movables that were placed on a road.
 * 
 * * numberOfFrames
 *   How many times the road cellular automaton was operated.
 *   Every frame represents a full recalculation of all cells starting from
 *   left to right.
 * 
 * * averageSpeed
 *   How fast in average the movables were in the circuit.
 * 
 * * totalResilienceMax
 *   This is the average resilience index calculated for the simulation.
 *   It represents how far it should be from the max region value of the system. 
 *   The value should be bellow 1.
 *   It is a cumulative value.
 * 
 * * totalResilienceMin
 *   This is the average resilience index calculated for the simulation.
 *   It represents how far from the minimum region value of the system.
 *   The value should be above 1.
 *   It is a cumulative value
 */



class Databank {



    /**
     * @param {int} id 
     * @param {int} numberOfCells 
     * @param {int} numberOfFrames
     * @param {int} initialFramesToDiscard 
     * @param {int} densityInit
     * @param {int} densityEnd
     * @param {int} densitySteps
     * @param {int} plotMaximumYValue
     * @param {int} plotMinimYValue
     * @param {float} movablePerformanceHighLimit 
     * @param {float} movablePerformanceLowLimit
     * @param {float} numberOfScenarios
     */
    constructor(
        numberOfSimulations,
        plotMaximumYValue,
        plotMinimumYValue,
    ) {




        //Multiple constructors in Javascript Hack!
        if (arguments.length === 1) {
            this.toValue(arguments[0]);
        }
        else {





            // ========================================================================== //
            // Privileged attributes

            //Structure to save common parameters
            this.common = {};

            this.common.numberOfSimulations = numberOfSimulations;
            this.common.plotMaximumYValue = plotMaximumYValue;
            this.common.plotMinimumYValue = plotMinimumYValue;

            this.links = new SerialisableMap();

        }






    }





    // ========================================================================== //
    // Public methods (Prototype methods)









    /**
 * This method deal with nested maps inside the JSON
 * 
 * This code is based in
 * https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
 * 
 * * It is placed here to save memory
 * 
 * @param {*} key 
 * @param {*} value 
 * @returns 
 */
    replacer(key, value) {

        return value;

    }






    // /**
    //  * This method deal with nested maps inside the JSON
    //  *
    //  * This code is based in
    //  * https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
    //  *
    //  * * It is placed here to save memory
    //  *
    //  * @param {*} key
    //  * @param {*} value
    //  * @returns
    //  */
    // replacer(key, value) {
    //     if (value instanceof Map) {
    //         return {
    //             dataType: 'Map',
    //             value: Array.from(value.entries()), // or with spread: value: [...value]
    //         };
    //     } else {
    //         return value;
    //     }
    // }





    // /**
    //  * This method deal with nested maps inside the JSON
    //  * 
    //  * This code is based in
    //  * https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
    //  * 
    //  * * It is placed here to save memory
    //  * 
    //  * @param {*} key 
    //  * @param {*} value 
    //  * @returns 
    //  */
    //     replacer(key, value) {
    //         if (value instanceof Map) {
    //             return {
    //                 dataType: 'Map',
    //                 value: Array.from(JSON.stringify(value.entries(), this.replacer, 2)), // or with spread: value: [...value]
    //             };
    //         } else {
    //             return value;
    //         }
    //     }




















    /**
     * * toString() is a prototype Object method so I am overriding it.
     * 
     * This code is called automatically when I create the Blob object if I use
     * type: "text/plain;charset=utf-8"
     * 
     * TODO So far the limit is about creating .txt about 1.5 GB in size.
     * This is enough to simulate scenarios but larger ones
     * can be simulated but not saved.
     * 
     * * Stringify by sections
     * is based on this:
     * https://stackoverflow.com/questions/17768548/nodejs-json-stringify-a-1gb-object-running-out-of-memory
     * 
     * It was implemented because replacer run out of memory.
     * It does not seem to work, so it is commented out.
     * 
     */
    toString() {

        //Making a copy ot the Databank
        const myDatabank = {};
        myDatabank.common = this.common;
        myDatabank.links = this.links;
        // myDatabank.scenariosRealTime = this.scenariosRealTime;





        //Stringify by sections
        //This code tries to stringify by sections.
        //This was implemented because on large JSONs the replacer run out of memory.
        // const x = myDatabank;
        // var output = "{"
        // var first = true;
        // for (var y in x) {
        //     if (x.hasOwnProperty(y)) {
        //         if (first) first = false;
        //         else output = output + ",";
        //         output = output + JSON.stringify(y, this.replacer) + ":" + JSON.stringify(x[y], this.replacer);
        //     }
        // }
        // output = output + "}";
        // const myDatabankString = output;





        //Last parameter, 2, is to activate pretty-printing. No value makes smaller files.
        //Activating parameter 2 makes the files so large that cannot use stringify anymore.
        //Replacer allows Stringify of maps

        const myDatabankString = JSON.stringify(myDatabank, this.replacer, 2);

        //const myDatabankString = JSON.stringify(myDatabank, this.replacer);

        return myDatabankString;
    }





    /**
     * This code is based in
     * https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
     * 
     */
    toValue(myDatabankString) {

        //This function recreates the stringified object with nested maps
        function reviver(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (value.dataType === 'SerialisableMap') {

                    let mySerialisableMap = new SerialisableMap(Object.entries(value.value));

                    return mySerialisableMap;
                }
            }
            return value;
        }


        //Reviver reconstruct maps and objects fron Strings
        const myDatabank = JSON.parse(myDatabankString, reviver);

        //Restoring parameters
        //Structure to save common parameters
        this.common = myDatabank.common;
        this.links = myDatabank.links;
        // this.scenariosRealTime = myDatabank.scenariosRealTime;

    }





    /**
     * 
     * Adds a link to the Databank
     */
    addLink(
        id,
        jsonRouter,
        keepLoop,
        framesNumber,
        initialFramesToDiscard,
        movableMaxSpeed,
        movablePerformanceHighLimit,
        movablePerformanceLowLimit,
        numberOfHackedMovables,
        probabilityRandomBrakeUniform,
        probabilityRandomBrakeMultiple,
        probabilityRandomBrakeArray,
        numberOfCells,
        densityInit,
        densityEnd,
        densitySteps,
        numberOfSimulations,
        plotMaximumYValue,
        plotMinimumYValue        
    ) {

        const link = {};

        link.id = id;
        link.jsonRouter = jsonRouter;
        link.keepLoop = keepLoop;
        link.framesNumber = framesNumber;
        link.initialFramesToDiscard = initialFramesToDiscard;
        link.movableMaxSpeed = movableMaxSpeed;
        link.movablePerformanceHighLimit = movablePerformanceHighLimit;
        link.movablePerformanceLowLimit = movablePerformanceLowLimit;
        link.numberOfHackedMovables = numberOfHackedMovables;
        link.probabilityRandomBrakeUniform = probabilityRandomBrakeUniform;
        link.probabilityRandomBrakeMultiple = probabilityRandomBrakeMultiple;
        link.probabilityRandomBrakeArray = probabilityRandomBrakeArray;
        link.numberOfCells = numberOfCells;
        link.densityInit = densityInit;
        link.densityEnd = densityEnd;
        link.densitySteps = densitySteps;
        link.numberOfSimulations = numberOfSimulations;
        link.plotMaximumYValue = plotMaximumYValue;
        link.plotMinimumYValue = plotMinimumYValue;





        //Use as a key the size of the Map
        const key = this.links.size.toString();

        //Saving the scenario as an object
        this.links.set(key, link);
    }





}