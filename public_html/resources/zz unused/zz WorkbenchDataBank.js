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
 */





/**
 * The purpose of this structure is to have a singular entry point
 * for all the data that is produced by the workbench and the
 * simulations.
 * 
 * Since the structure of the database is a tree, it is not necessary
 * to use a database and it is easy to use a single object reference
 * 
 * The object structure is:
 * 
 * - WorkbenchDataBank
 *   |---Common
 *       |------Number of Cells
 *       |------Number of Frames
 *       |------Initial Frames to discard
 *       |------Density Init
 *       |------Density End
 *       |------Density Steps
 *       |------Plot Maximum Y Value 
 *       |------Plot Minimum Y Value
 *       |------Movable Max Speed
 *       |------Movable Performance High Limit
 *       |------Movable Performance Low Limit 
 *       |------controlNumberOfSimulations
 *       |------controlNumberOfHackedMovables
 *       |------controlProbabilityRandomBrake
 *       |------controlArrayProbabilityRandomBrake
 *       |------attackNumberOfSimulations
 *       |------attackNumberOfHackedMovables
 *       |------attackProbabilityRandomBrake
 *       |------attackArrayProbabilityRandomBrake
 *       |------sensor
 * 
 * 
 *   |---Control
 *       |------Simulations 
 *           |-------SimulationDensities
 *                |-------Density i
 *                |-------Density i+1
 *                |-------Density ...
 *                |-------Density n 
 *                     |-------Frames
 *                     |-------totalMovablessCrossedFinishLine
 *                     |-------totalMovablesCrossedFinishLinePerFrame
 *                     |-------numberOfMovables
 *                     |-------numberOfFrames
 *                     |-------averageSpeed
 *                     |-------totalResilienceMax
 *                     |-------totalResilienceMin
 * 
 *   |---Attack
 *       |------Simulations
 *           |-------SimulationDensities
 *                |-------Density i
 *                |-------Density i+1
 *                |-------Density ...
 *                |-------Density n
 *                     |-------Frames
 *                     |-------totalMovablessCrossedFinishLine
 *                     |-------totalMovablesCrossedFinishLinePerFrame
 *                     |-------numberOfMovables
 *                     |-------numberOfFrames
 *                     |-------averageSpeed
 *                     |-------totalResilienceMax
 *                     |-------totalResilienceMin
 *              
 * I decided to use an object because it would be easier to document what
 * the results of the simulator are. 
 * 
 * * Numbers of Cells:
 *   This is the amount of "cells" that will have a road. 
 *   The original consideration for the NaSch model is that each cell would be
 *   about 3.5 meters long, so it would fit an average car. This consideration
 *   however, is not really important for this synthetic problem.
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
 * * Plot Maximum Y Value:
 *   This is the maximum value of the Y axis of the plots that are produced.
 *   Typically 100
 * 
 * * Plot Minimum Y Value:
 *   This is the minimum value of the Y axis of the plots that are produced.
 *   Typically 0.
 * 
 * * Movable Max Speed:
 *   Max performance of the movable. Usually 5
 * 
 * * movablePerformacenHighLimit
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
 * * controlNumerOfSimulations
 *   How many simulations will be done. This are iterations of the same
 *   simulation
 * 
 * * controlNumberOfHackedVehicles
 *   This parameter tells how many vehicles are  having problems in decision
 *   making.
 * 
 * * controlProbablityRandomBrake
 *   This value models the probability of braking, also known as p.
 *   p=0 means there are no probability of braking, p=1 means that will be
 *   braking.
 *   This parameter is used when there is a single value for the whole road. 
 * 
 *  * controlProbabilityRandomBrakeMultiple
 *   This saves the value of a radio button that indicates if the simulation
 *   uses uniform value or multiple values. I am saving just multiple values
 *   since unifor is the opposite. 
 * 
 * * controlProbablityRandomBrakeArray
 *   This is an array of values or probability of braking, also known as p.
 *   p=0 means there are no probability of braking, p=1 means that will be
 *   braking.
 *   This parameter is used when there are different p for each cell on the 
 *   road.
 * 
 * * attackNumerOfSimulations
 *   How many simulations will be done. This are iterations of the same
 *   simulation
 * 
 * * attackNumberOfHackedVehicles
 *   This parameter tells how many vehicles are  having problems in decision
 *   making.
 * 
 * * attackProbablityRandomBrake
 *   This value models the probability of braking, also known as p.
 *   p=0 means there are no probability of braking, p=1 means that will be
 *   braking.
 *   This parameter is used when there is a single value for the whole road. 
 * 
 * * attackProbabilityRandomBrakeMultiple
 *   This saves the value of a radio button that indicates if the simulation
 *   uses uniform value or multiple values. I am saving just multiple values
 *   since unifor is the opposite. 
 * 
 * * attackProbablityRandomBrakeArray
 *   This is an array of values or probability of braking, also known as p.
 *   p=0 means there are no probability of braking, p=1 means that will be
 *   braking.
 *   This parameter is used when there are different p for each cell on the 
 *   road.
 * 
 * * Sensor
 *   This is an object that has all the information regarding the simulated 
 *   sensing that happens on the cell.
 * 
 * 
 * 
 * 
 * * For each dentisy at control and Attack:
 *
 * 
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



class WorkbenchDataBank {



    /**
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
     * @param {int} controlNumberOfSimulations
     * @param {int} controlNumberOfHackedMovables
     * @param {float} controlProbabilityRandomBrake
     * @param {boolean} controlProbabilityRandomBrakeMultiple
     * @param {array} controlProbabilityRandomBrakeArray
     * @param {int} attackNumberOfSimulations
     * @param {int} attackNumberOfHackedMovables
     * @param {float} attackProbabilityRandomBrake
     * @param {boolean} attackProbabilityRandomBrakeMultiple
     * @param {array} attackProbabilityRandomBrakeArray
     */
    constructor(numberOfCells,
        numberOfFrames,
        initialFramesToDiscard,
        densityInit,
        densityEnd,
        densitySteps,
        plotMaximumYValue,
        plotMinimumYValue,
        movableMaxSpeed,
        movablePerformanceHighLimit,
        movablePerformanceLowLimit,
        controlNumberOfSimulations,
        controlNumberOfHackedMovables,
        controlProbabilityRandomBrake,
        controlProbabilityRandomBrakeMultiple,
        controlProbabilityRandomBrakeArray,
        attackNumberOfSimulations,
        attackNumberOfHackedMovables,
        attackProbabilityRandomBrake,
        attackProbabilityRandomBrakeMultiple,
        attackProbabilityRandomBrakeArray,
        
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

            this.common.numberOfCells = numberOfCells;
            this.common.numberOfFrames = numberOfFrames;
            this.common.initialFramesToDiscard = initialFramesToDiscard;
            this.common.densityInit = densityInit;
            this.common.densityEnd = densityEnd;
            this.common.densitySteps = densitySteps;
            this.common.plotMaximumYValue = plotMaximumYValue;
            this.common.plotMinimumYValue = plotMinimumYValue;
            this.common.movableMaxSpeed = movableMaxSpeed;
            this.common.movablePerformanceHighLimit = movablePerformanceHighLimit;
            this.common.movablePerformanceLowLimit = movablePerformanceLowLimit;




            //Structure to save control parameters
            this.control = {};
            this.control.numberOfSimulations = controlNumberOfSimulations;
            this.control.numberOfHackedMovables = controlNumberOfHackedMovables;
            this.control.probabilityRandomBrake = controlProbabilityRandomBrake;
            this.control.probabilityRandomBrakeMultiple = controlProbabilityRandomBrakeMultiple;
            this.control.probabilityRandomBrakeArray = controlProbabilityRandomBrakeArray;

            //Simulations
            this.control.simulations;

            //Array 0 is top delimiter. Array 1 is min delimiter
            this.control.controlRegionTraces;

            //Structure to save attack parameters
            this.attack = {};
            this.attack.numberOfSimulations = attackNumberOfSimulations;
            this.attack.numberOfHackedMovables = attackNumberOfHackedMovables;
            this.attack.probabilityRandomBrake = attackProbabilityRandomBrake;
            this.attack.probabilityRandomBrakeMultiple = attackProbabilityRandomBrakeMultiple;
            this.attack.probabilityRandomBrakeArray = attackProbabilityRandomBrakeArray;

            //Simulations
            this.attack.simulations;

            //Array 0 is top delimiter. Array 1 is min delimiter
            this.attack.attackRegionTraces;



        }






    }







    // ========================================================================== //
    // Public methods (Prototype methods)





    /**
     * This method deasl with nested maps inside the JSON
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
        if (value instanceof Map) {
            return {
                dataType: 'Map',
                value: Array.from(value.entries()), // or with spread: value: [...value]
            };
        } else {
            return value;
        }
    }






    /**
     * * toString() is a prototype Object method so I am overriding it.
     * 
     * This code is called automatically when I create the Blob object if I use
     * type: "text/plain;charset=utf-8"
     * 
     * TODO So far the limit is about creating .txt about 1.5 GB in size.
     * This is enough to simulate so interesting scenarios but larger ones
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

        //Making a copy ot the workBenchDataBank
        const myWorkbenchDataBank = {};
        myWorkbenchDataBank.attack = this.attack;
        myWorkbenchDataBank.common = this.common;
        myWorkbenchDataBank.control = this.control;




        
        //Stringify by sections
        //This code tries to stringify by sections.
        //This was implemented because on large JSONs the replacer run out of memory.
        // const x = myWorkbenchDataBank;
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
        // const myWorkbenchDataBankString = output;





        //Last parameter, 2, is to activate pretty-printing. No value makes smaller files.
        //Activating parameter 2 makes the files so large that cannot use stringify anymore.
        //Replacer allows Stringify of maps
        // const myWorkbenchDataBankString = JSON.stringify(myWorkbenchDataBank, this.replacer, 2);

        const myWorkbenchDataBankString = JSON.stringify(myWorkbenchDataBank, this.replacer);

        return myWorkbenchDataBankString;
    }





    /**
     * This code is based in
     * https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
     * 
     */
    toValue(myWorkbenchDataBankString) {

        //This function recreates the stringified object with nested maps
        function reviver(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (value.dataType === 'Map') {
                    return new Map(value.value);
                }
            }
            return value;
        }


        //Reviver reconstruct maps and objects fron Strings
        const myWorkbenchDataBank = JSON.parse(myWorkbenchDataBankString, reviver);

        //Restoring parameters
        //Structure to save common parameters
        this.common = myWorkbenchDataBank.common;
        this.control = myWorkbenchDataBank.control;
        this.attack = myWorkbenchDataBank.attack;

    }








}