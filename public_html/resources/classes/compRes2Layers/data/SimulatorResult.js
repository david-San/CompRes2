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
 * This is a simulator result object.
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
 * * Density:
 *   This value express how many movables commodities would be located in the road.
 *   The minimum is 0 and the maxmum should be 1.
 *   The simulator calculates how many cars is going to place to achieve 
 *   the density specified.
 * 
 * * performanceLowLimit
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
 * * performacenHighLimit
 *   This value specifies the maximum value for the system to be effective.
 *   This is the resilience frontier.
 *   The maximum value should be similar to the upp er box graphics frontier
 *   when there are no adversarial events.
 * 
 * * frames
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

class SimulatorResult {



    /**
     * 
     * @param {int} numberOfCells 
     * @param {int} density 
     * @param {float} speedLowLimit 
     * @param {float} speedHighLimit 
     * @param {Map} frames 
     * @param {int} totalMovablesCrossedFinishLine 
     * @param {float} totalMovablesCrossedFinishLinePerFrame
     * @param {int} numberOfMovables 
     * @param {int} numberOfFrames
     * @param {float} averageSpeed 
     * @param {integer} initialFramesToDiscard 
     * @param {float} totalResilienceMax 
     * @param {float} totalResilienceMin
     */
    constructor(numberOfCells,
        density,
        speedLowLimit,
        speedHighLimit,
        frames,
        numberOfMovables,
        numberOfFrames,
        totalMovablesCrossedFinishLine,
        totalMovablesCrossedFinishLinePerFrame,
        averageSpeed,
        initialFramesToDiscard,
        resilienceSpeedTotalMax,
        resilienceSpeedTotalMin,

        resilienceFlowBoundaryRegionMax,
        resilienceFlowBoundaryRegionMin) {





        // ========================================================================== //
        // Privileged attributes

        this.numberOfCells = numberOfCells;
        this.density = density;
        this.speedLowLimit = speedLowLimit;
        this.speedHighLimit = speedHighLimit;
        this.frames = frames;
        this.totalMovablesCrossedFinishLine = totalMovablesCrossedFinishLine;
        this.numberOfMovables = numberOfMovables;
        this.numberOfFrames = numberOfFrames;
        this.totalMovablesCrossedFinishLinePerFrame = totalMovablesCrossedFinishLine / numberOfFrames;
        this.totalMovablesCrossedFinishLinePerFrame = totalMovablesCrossedFinishLinePerFrame;
        this.averageSpeed = averageSpeed;
        this.initialFramesToDiscard = initialFramesToDiscard;

        this.resilienceSpeedTotalMax=resilienceSpeedTotalMax;
        this.resilienceSpeedTotalMin = resilienceSpeedTotalMin;
        
        this.resilienceFlowBoundaryRegionMax = resilienceFlowBoundaryRegionMax;
        this.resilienceFlowBoundaryRegionMin = resilienceFlowBoundaryRegionMin;
        this.resilienceFlowIndexMax = totalMovablesCrossedFinishLine / resilienceFlowBoundaryRegionMax;
        this.resilienceFlowIndexMin = totalMovablesCrossedFinishLine / resilienceFlowBoundaryRegionMin;


        


    }







    // ========================================================================== //
    // Public methods (Prototype methods)





}