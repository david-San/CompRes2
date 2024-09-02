/* 
 * David Sanchez
 * Newcastle University
 * 
 * 2022 Mar 21: Created
 * This is a cellular automaton simulator.
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
 * This is a unidimensional cellular automaton simulator. 
 * Movable represents cars that can travel through an array.
 * 
 * e.g.
 * # (number) is the speed of a movable commodity (movable) 
 * M occupies a block when travelling from one cell to another
 * M departs from A and final destination is B
 * A and B are nodes.
 * 
 * M....M....M....M......M.....M.....M.....M  
 * A---------------------------------------B 
 * 
 * 
 * A simulator may have one or more scenarios:
 * 
 * - Normal simulations have one scenario.
 * - Real Time simulations my have more than one scenario
 *   that is typically switched after a series of frames.
 * 
 */

class Simulator {





    /**
     * Road length is the size of the road. 
     * 
     * @param {int} numberOfCells 
     * @param {float} density
     * @param {int} initialFramesToDiscard
     * @param {float} movablePerformanceHighLimit
     * @param {float} movablePerformanceLowLimit
     * @param {int} movableVelocityMax
     * @param {Map} scenarios
     * @param {Boolean} realTimeMode
     */
    constructor(
        numberOfCells,
        density,
        initialFramesToDiscard,
        movablePerformanceHighLimit,
        movablePerformanceLowLimit,
        movableVelocityMax,
        scenarios,
        realTimeMode) {





        // ========================================================================== //
        // Privileged attributes
        //TODO Verify that this has to be public. I think I should make them private by convention.
        this.numberOfCells = numberOfCells;
        this.density = density;
        this.initialFramesToDiscard = initialFramesToDiscard;
        this.speedLowLimit = movablePerformanceLowLimit;
        this.speedHighLimit = movablePerformanceHighLimit;
        this.velocityMax = movableVelocityMax;
        this.scenarios = scenarios;
        this.realTimeMode = realTimeMode;






        //Performance metrics. Finish line is the last array postion
        this.totalMovablesCrossedFinishLine = 0;
        this.totalMovablesCrossedFinishLinePerNFrames = 0;
        this.numberOfMovables = 0;
        this.sumMovablesVelocitiesPerFrame = 0;
        this.averageVelocityPerFrame = 0;
        this.currentFrame = 0;






        //RealTime
        this.realTime_currentDensity;






        //! Working here!

        //If _sharedObject.scenario is NaN, this is a combined scenario
        this.scenarioId = _sharedObject.scenario;


        //I need a scenario to calculates the densities, but I need 
        //to know if this is a combined scenario
        this.scenarioId = isNaN(_sharedObject.scenario) ? 0 : _sharedObject.scenario;


        // this.scenario = this.databank.scenarios.get(this.scenarioId);
        //! Working here!





        // ========================================================================== //
        // Private attributes
        // By convention
        this._numberOfFrames;
        this._cells = new Array(numberOfCells);

        this._frames = new SerialisableMap();

        //TODO Delete this
        // this._frames = new Map();
        
        
        this._totalOfMovablesHacked = 0;
        this._currentScenario;

        //This array stores an additional reference to movables.
        //Each movable is stored in two places, in the _cell to have position and 
        //This arrayOfMovables is used to hack the movables faster.
        this._arrayOfMovables = new Array();


        //Array of the transition scenarios that fed by user
        const defaultTransition = {
            "transitionScenario": 0,
            "transitionFrame": 0
        }
        this._transitionScenariosArray=new Array(defaultTransition);
        this._transitionScenariosIndex = 0;



        //Pointer to the current Scenario scensor. This is shared through by all movables.
        this._currentScenarioScensor;




        // ========================================================================== //
        // Private methods





        // ========================================================================== //
        // Privileged methods





        this.init();
    }





    // ========================================================================== //
    // Public methods (Prototype methods)





    /**
     * Inits everything 
     */
    init() {

        this.updateScenario(0);
    }





    /**
     * This populates the cells (that represent at road) with movable objects
     * (cars) using a random function until the desired density is achieved.
     * 
     * If initialDensity= 0, then no movables will be placed on the road
     * 
     * Note:
     * Math.random() is used because this library was designed to produce
     * randomly scatterd values arount the number space which are good for 
     * statistical simulations. Since this is a simulation I am getting
     * more usable values than with other methods like Crypto.getRandomValues()
     * 
     */
    fillCellsAccordingToDensity() {

        const density = this.density;

        if (density > 0) {

            //I need to save this for metrics purposes
            const numberOfCells = this.numberOfCells;
            const road = this._cells;
            const kind = "clear";
            let numberOfMovables = Math.abs(Math.round(numberOfCells * density));
            let randomPosition;
            let id = 0;

            this.numberOfMovables = numberOfMovables;

            if (numberOfMovables < numberOfCells) {

                while (numberOfMovables > 0) {

                    //Mat.random() note on the method description
                    randomPosition = Math.floor((Math.random() * numberOfCells));

                    if (road[randomPosition] === undefined) {

                        const myVelocity = 0;
                        let myMovable = this.createMovable(randomPosition, myVelocity, kind);

                        road[randomPosition] = myMovable;

                        //Keep a reference to the movable for easier hacking
                        this._arrayOfMovables.push(myMovable);

                        numberOfMovables = numberOfMovables - 1;
                        id = id + 1;
                    }
                }
            }
        }
    }




    
    /**
     * This adjust the amoung ot hacked movables in the cells.
     * 
     * - If numberOfHackedMovables is larger than what already is, then it
     *   searches for unhacked vehicles and mark them as hacked.
     * 
     * - If numberOfHackedMovables is smaller than what already is, then it
     *   searches for hacked vehicles and mark them as clear.
     * 
     * At the end, the cells should have the numberOfHackedMovables
     * specified in the parameter.
     * 
     */
    updateAmountOfHackedMovables(numberOfHackedMovables) {


        //Calculating how many extra movables I have to hack
        const movables = this._arrayOfMovables;
        const numberOfMovables = movables.length;
        const movablesAlreadyHacked = this._totalOfMovablesHacked;

        let totalOfMovablesToSearch;
        let searchFor;
            
        //Case 1
        if (numberOfHackedMovables >= numberOfMovables) {
                
            totalOfMovablesToSearch = numberOfMovables;
            searchFor = "clear"

        } else if ((numberOfHackedMovables < numberOfMovables) && (movablesAlreadyHacked <= numberOfHackedMovables)) {
                
            //Add more hacked movables
            totalOfMovablesToSearch = numberOfHackedMovables - movablesAlreadyHacked;
            searchFor = "clear"

        } else if ((numberOfHackedMovables < numberOfMovables) && (movablesAlreadyHacked > numberOfHackedMovables)) {
            
            //Substract hacked movables
            totalOfMovablesToSearch =  movablesAlreadyHacked - numberOfHackedMovables;
            searchFor = "hacked"

        }
         
        

        while (totalOfMovablesToSearch > 0) {

            let randomPosition = Math.floor((Math.random() * numberOfMovables));

            if (movables[randomPosition] !== undefined) {

                let myMovable = movables[randomPosition];


                if (searchFor === "clear" && myMovable.kind === "clear") {
                    
                    let myHackedStakeholder = new StakeholderHack1(this.probabilityRandomBrake, this.velocityMax);

                    myMovable.setStakeholder(myHackedStakeholder);
                    myMovable.setKind("hacked");

                    //Keep track of the totals hacked
                    this._totalOfMovablesHacked = this._totalOfMovablesHacked + 1;

                    totalOfMovablesToSearch--;


                } else if (searchFor === "hacked" && myMovable.kind === "hacked") {

                    let myClearStakeholder = new Stakeholder(this.probabilityRandomBrake, this.velocityMax);

                    myMovable.setStakeholder(myClearStakeholder);
                    myMovable.setKind("clear");

                    //Keep track of the totals hacked
                    this._totalOfMovablesHacked = this._totalOfMovablesHacked - 1;

                    totalOfMovablesToSearch--;
                }
            }
        }
    }





    /**
      * This function checks how many spaces there are from a given position
      * occupied by a movable to the next movable.
      * Since this is a closed system, once it reaches the end, it keeps
      * searching at the beginning on the array.
      * It is guaranteed that it is going to find at least itself.
      *  
      * @param {Interger} position 
      * @returns {Integer} distance
      */
    findDistanceToNextMovable(position) {

        let distance = 0;
        const cells = this._cells;

        let i = (position + 1) % cells.length;

        while (cells[i] === undefined) {
            distance = distance + 1;
            i = i + 1;
            i = i % cells.length;
        }
        return distance;
    }





    /**
     * This storage each of the simulation into a map
     */
    storeFrame(cells) {

        const cellsClone = JSON.parse(JSON.stringify(cells));


        const key = this._frames.size.toString();

        //TODO Delte this
        // const key = this._frames.size;

        this._frames.set(key, cellsClone);
    }





    /**
     * This calculates the movables resilience index bassed on:
     * 
     *                  Sum_{0}^{T} P(t)
     *  Resilience_Max= --------------------
     *                  Sum_{0}^(T) TP(t)    
     * 
     * 
     * TODO verify if it can re-use the average speed per frame
     */
    calculateResilience() {

        const framesNumber = this._frames.size;
        const numberOfMovables = this.numberOfMovables;
        const initialFramesToDiscard = this.initialFramesToDiscard;
        const speedHighLimit = this.speedHighLimit;
        const speedLowLimit = this.speedLowLimit;
        const totalMovablesCrossedFinishLine = this.totalMovablesCrossedFinishLine;
        const numberOfFrames = this._numberOfFrames;
        const numberOfCells = this.numberOfCells;
        const density = this.density;

        let totalAverageSpeed = 0;
        // let totalPerformance = 0;
        let totalMaxExpected = 0;
        let totalMinExpected = 0;


        for (let i = initialFramesToDiscard; i < framesNumber; i++) {

            let frames = this._frames;


            let cells = frames.get(i.toString());

            //TODO Delete this
            // let cells = frames.get(i);



            // let numberOfFrames = this._numberOfFrames;
            let totalSpeedOfAllMovables = 0;
            let totalNumberOfMovables = 0;


            //Calculates the average speed of the road
            for (let j = 0; j < cells.length; j++) {

                if ((cells[j] !== null) && (cells[j].constructor === Object)) {
                    let myMovable = cells[j];

                    totalSpeedOfAllMovables = totalSpeedOfAllMovables + myMovable.velocity;
                    totalNumberOfMovables = totalNumberOfMovables + 1;
                }
            }

            let averageSpeed = totalSpeedOfAllMovables / totalNumberOfMovables;

            totalAverageSpeed = totalAverageSpeed + averageSpeed;
            totalMaxExpected = totalMaxExpected + speedHighLimit;
            totalMinExpected = totalMinExpected + speedLowLimit;
        }


        const resilienceSpeedTotalMax = totalAverageSpeed / totalMaxExpected;
        const resilienceSpeedTotalMin = totalAverageSpeed / totalMinExpected;


        const totalMovablesCrossedFinishLinePerFrame = totalMovablesCrossedFinishLine / numberOfFrames;



        //TODO Add to the interface a dialog explainging it cannot be possible when 
        const speedAverage = (totalAverageSpeed / (numberOfFrames - initialFramesToDiscard));




        if (initialFramesToDiscard >= numberOfFrames) {
            console.log(" 'Initial Frames to Discard' cannot be larger than the 'number of frames'")
        }



        const resilienceFlowBoundaryRegionMax = 0;
        const resilienceFlowBoundaryRegionMin = 0;


        let mySimulatorResult = new SimulatorResult(
            numberOfCells,
            density,
            speedLowLimit,
            speedHighLimit,
            this._frames,
            numberOfMovables,
            numberOfFrames,
            totalMovablesCrossedFinishLine,
            totalMovablesCrossedFinishLinePerFrame,
            speedAverage,
            initialFramesToDiscard,
            resilienceSpeedTotalMax,
            resilienceSpeedTotalMin,

            resilienceFlowBoundaryRegionMax,
            resilienceFlowBoundaryRegionMin
        );


        return mySimulatorResult;
    }





    /**
     * 
     * Runs the simulator
     * 
     * * Note
     * When the simulator runs to calculate the "resilience region" there are
     * a number of frames that are discarded using the parameter
     * initialFramesToDiscard.
     * These frames are discarded because they are not representative of the
     * flow for the density it is trying to characterise because movables were
     * accelerating (The system has not estabilised yet).
     * In real time mode, this consideration is valid as well, therefore, to get
     * the correct flow at a particular density in real time the
     * numberOfFrames have to be adjusted to the total 
     * numberOfFrames-InitialFramesToDiscard.
     * If this adjustment is not made, the real time simulation will always
     * produce a higher flow than the resilience region, because it will be
     * counting the output of the initialFramesToDiscard, but
     * this initialFramesToDiscard was not considered when creating
     * the resilienceRegion.
     * In summary, initialFramesToDiscard cannot be considered when creating the
     * resilienceRegion because the system has not yet stabilised.
     * 
     * @param {*} numberOfFrames 
     * @returns object containing the simulation and all statistics
     */
    run(numberOfFrames) {

        //Saving the original parameter. I will use this to calculate metrics.
        this._numberOfFrames = numberOfFrames;


        if (this.realTimeMode) {
            //See note on method
            const initialFramesToDiscard = this.initialFramesToDiscard;

            //Adjusting flow to the resilience region previous computation
            numberOfFrames = numberOfFrames - initialFramesToDiscard;
        }


        for (let i = 0; i < numberOfFrames; i++) {

           
            //Verify that there is not a transition happening
            this.updateScenario(i);


 
            //Cells have an initial state that has to be saved
            this.storeFrame(this._cells);



            //Create a new frame, moving movables inside the cells
            this.createFrame();
            
        }


        //TODO It seems, this is not only used in realTimeMode, verify and rename if that is the case
        //Calculate the current density after the given number of frames
        this.realTimeMode_calculateCurrentDensity();

        //Calculate the resilience index for the simulation
        const simulatorResult = this.calculateResilience();

        return simulatorResult;
    }





    /**
     * This method updates the metrics of the simulator.
     * In particular, to track if the movable has passed through the 
     * last position of the road and being fed back to the system.
     * When this happens the movable is not necessarily registered
     * at the last position of the array, but the movable went through
     * the limits, so it should be counted.
     * 
     * * Reason for the realTime consideration when counting flow.
     * The purpose of the metrics is to get a measurement of the characteristic
     * flow of the system at a particular density. However, when the simulator 
     * starts, in particular when all movables start at speed 0, there can be 
     * an inconsistent flow because vehicles are accelerating.
     * To avoid this, I included a parameter, "initialFramesToDiscard".
     * This parameter tells the system, not to consider what happens in those
     * initial frames, because it is not representative of the flow for that 
     * particular density. I use this parameter to calculate the average speed.
     * 
     * e.g. When calculating the resiience region, I could use 60 frames and
     * discard 10. This gives me the flow of 50 frames after the 10 frames used 
     * for acceleration. If I considered the original 60 frames, I could get
     * 45 vehicles, but if I considered only the last 50 frames, I could get 41
     * vehicles. This shows, that the first 10 frames used for accelreation
     * do not reprsent the average flow for that density, so I cannot use them.
     * However, this is only valid when I am calculating the resilience region.
     * In real time, I do not have this acceleration issues because all
     * movable are already accelerated.
     * 
     * 
     * 
     * 
     * @param {integer} newPosition 
     * @param {movable} movable 
     */
    metricsUpdate(newPosition, movable) {


        if (this.realTimeMode) {
            //Read note on the method.
            //Simulator is on realTime, so there is no acceleration threshold

            if (newPosition < movable.x) {
                this.totalMovablesCrossedFinishLine = this.totalMovablesCrossedFinishLine + 1;
                this.totalMovablesCrossedFinishLinePerNFrames = this.totalMovablesCrossedFinishLinePerNFrames + 1;
            }

            //Calculate average speed of the movables
            this.sumMovablesVelocitiesPerFrame = this.sumMovablesVelocitiesPerFrame + movable.velocity;


        } else {

            //There is an acceleration threshold that has to be considered
            //Since the simulation starts by resetting the counter, 
            //there is never a frame 0. I can simply ask for > initialFramesToDiscard

            if ((newPosition < movable.x) && (this.currentFrame > this.initialFramesToDiscard)) {
                this.totalMovablesCrossedFinishLine = this.totalMovablesCrossedFinishLine + 1;
                this.totalMovablesCrossedFinishLinePerNFrames = this.totalMovablesCrossedFinishLinePerNFrames + 1;
            }

            //Calculate average speed of the movables
            this.sumMovablesVelocitiesPerFrame = this.sumMovablesVelocitiesPerFrame + movable.velocity;
        }
    }





    /**
     * This method resets the statistics for the frame.
     * It saves the average speed for the movables beforehand
     */
    metricsResetForFrame() {

        //Calculate the average velocity for the frame that just elapsed (Previous frame)
        this.averageVelocityPerFrame = this.sumMovablesVelocitiesPerFrame / this.numberOfMovables;

        this.sumMovablesVelocitiesPerFrame = 0;

        //Updates the frame counter
        this.currentFrame = this.currentFrame + 1;
    }





    /**
     * This moves all objects in cells. It is used to create a frame.
     * 
     * It moves all movables in a closed system, movables loop like in a
     * Nascar race.
     * Objects that arrive to the end of the array are then feed back at the 
     * beginning of the array. This can also be seen as a loop pipeline
     * 
     * e.g.
     * 
     *    0 . .
     *    . 1 .
     *    . . 1
     *    1 . .
     *    . 1 .
     *    . . 1 
     * 
     * 
     * - The algorithm navigates the array from right to left.
     *   When doing so, it moves movables to the right according to speed.
     * 
     * - An interesting case happens at the end of the array.
     *   Since the movable has to be pushed to the begining, it has
     *   to be prevented the double evaluation.
     *   (The index loop is at the right coming to the left, and this 
     *   movable was already evaluated. Placing on the left will cause the 
     *   algorithm to evaluated it twice)
     *   To prevent double evaluation, off limit movables are placed in a 
     *   map that will be processed at the end of the automata loop.
     *   The map saves the position as key (since movables can occupy one
     *   position only) and the movable object as value.
     * 
     *   - If the simulator is operating in "realTimeMode", toggled by a 
     *   flag, when the movables reach the end of the road are renamed with 
     *   a new ID that is created with a UUID. This is done because the
     *   animation tracks IDs. If the same ID is used, then you can see an
     *   animation of the movable sent back to the beginning. It does not look
     *   nice because it causes visual interference. By changing the ID,
     *   plotly fades the movable and replaces it with another one. This gives
     *   the ilussion that the movable went away and a new one with the same
     *   colour is arriving to the road.
     */
    moveMovablesInFrame() {

        const top = this._cells.length;
        const cells = this._cells;

        //movables move from left to right
        let i = 0;

        while (i < top) {

            if ((cells[i] !== undefined) && (cells[i].constructor === Movable)) {

                let nextMovableDistance = this.findDistanceToNextMovable(i);

                let myMovable = cells[i];

                myMovable.stakeholderDecide(nextMovableDistance, i);

                let myMovablePosition = myMovable.x;

                //Deletes the movable from the previous position
                delete cells[i];

                //Relocates the movable. 
                //Since this is a closed system, 
                //movables beyond the last array position are modulus located 
                //inside the array                    
                let newPosition = myMovablePosition % cells.length;

                if (this.realTimeMode) {
                    //In real time, it changes the ID of the movable. See Note
                    if (newPosition < myMovablePosition) {
                        const newId = crypto.randomUUID();
                        myMovable.id = newId;
                    }
                }

                //This updates the metrics on the system
                this.metricsUpdate(newPosition, myMovable);

                myMovable.x = newPosition;
                cells[newPosition] = myMovable;

                if (newPosition > i) {
                    //If the new position is higher than the current one, 
                    //then start from this new position to avoid processing
                    //the same mobile twice.
                    i = newPosition;
                }
            }
            i++;
        }
    }





    /**
     * This creats a frame on the simulator.
     * 
     * To create a frame means to move all movables inside the cells.
     */
    createFrame() {

        this.metricsResetForFrame();
        this.moveMovablesInFrame();

    }





    /**
     * This method creates a movable.
     * 
     * It is called:
     * - At the beginning when filling the road for the first time
     *   and in realTime randomly when the density changes.
     * - When the simulator operates in real time.
     * 
     * Notes:
     * - The sensor is shared by all objects. This saves memory
     *   
     * @param {integer} position 
     * @param {integer} velocity
     * @param {String} kind
     *  
     * @returns {Object} movable
     * 
     */
    createMovable(position, velocity, kind) {

        //TODO Delete this
        // const mySensor = this.scenarios.get(this._currentScenario).sensor;
        // const myStakeholder = new Stakeholder(this.velocityMax, mySensor);


        const myStakeholder = new Stakeholder(this.velocityMax, this._currentScenarioScensor);

        const id = crypto.randomUUID();

        const myMovable = new Movable(id, position, myStakeholder, kind);
        myMovable.velocity = velocity;

        return myMovable;

    }





    // ========================================================================== //
    // Real Time methods only





    /**
     * This calculates the current density based on:
     * 
     *                  (# Mobiles on the system)
     * CurrentDensity = --------------------------
     *                  (# of cells in the system)
     * 
     * It updates a state variable.
     */
    realTimeMode_calculateCurrentDensity() {

        const numberOfCells = this.numberOfCells;
        const cells = this._cells;
        const top = cells.length;

        let totalNumberOfMovables = 0;;

        for (let i = 0; i < top; i++) {
            if ((cells[i] !== undefined) && (cells[i].constructor === Movable)) {

                totalNumberOfMovables = totalNumberOfMovables + 1;

            }
        }

        const currentDensity = totalNumberOfMovables / numberOfCells;

        this.realTime_currentDensity = currentDensity;

    }





    /**
     * This method adds a movable to the cells.
     * It has a loop that verifies that can add a movable to a cell that
     * has no movables on it.
     */
    realTimeMode_addMovable() {


        const myTentativePosition = 0;
        const myVelocity = Math.round(this.averageVelocityPerFrame);

        const myMovable = this.createMovable(myTentativePosition, myVelocity, "clear");


        const top = this._cells.length;
        const cells = this._cells;
        let found = false;

        //movables move from left to right
        let i = 0;


        while (i < top && !found) {

            if (cells[i] === undefined) {

                cells[i] = myMovable;
                myMovable.x = i;

                //Stops the search
                found = true;
            }
            i++;
        }

        this._cells = cells;
        this.numberOfMovables = this.numberOfMovables + 1;
    }





    /**
     * This method deletes a movable from the cells.
     * It deletes the first movable it finds, 
     * starting from position 0.
     */
    realTimeMode_deleteMovable() {

        const top = this._cells.length;
        const cells = this._cells;
        let found = false;

        //movables move from left to right
        let i = 0;


        while (i < top && !found) {

            if (cells[i] !== undefined) {


                //Deletes the movable
                delete cells[i];

                //Stops the search
                found = true;
            }
            i++;
        }

        this._cells = cells;
        this.numberOfMovables = this.numberOfMovables - 1;
    }





    /**
     * This method sets the right scenario to run the simulator.
     * 
     * In normal simulations there is only one scenario, but
     * in real time simulations there can be more than one scenario.
     * 
     */
    updateScenario(frame) {

        //Initialise the transition frame. It will be rewritten, if exists.
        let transitionFrame = 0;
        let topOfTransitionScenarios;

        //Initial scenario, if it is not defined
        if (isNaN(this._currentScenario)) {

            //fillCellsAccordingToDensity needs to load scenario 0
            this._currentScenario = 0;
        }

        //Load the scenario
        if (Array.isArray(this._transitionScenariosArray)) {

            //Any other scenario
            topOfTransitionScenarios = this._transitionScenariosArray.length - 1;

            //Verify there are additional transition scenarios
            if (this._transitionScenariosIndex <= topOfTransitionScenarios) {
                transitionFrame = this._transitionScenariosArray[this._transitionScenariosIndex].transitionFrame;
            }
        }

        //Verify frames have not passed the transition scenarios
        if ((frame === transitionFrame) && (this._transitionScenariosIndex <= topOfTransitionScenarios)) {


            const transitionScenario = this._transitionScenariosArray[this._transitionScenariosIndex].transitionScenario.toString();  

            //TODO Delete this
            // const transitionScenario = this._transitionScenariosArray[this._transitionScenariosIndex].transitionScenario.toString();  
            
            const myScenario = this.scenarios.get(transitionScenario);
            const numberOfHackedMovables = myScenario.numberOfHackedMovables;
            this._currentScenario = transitionScenario;

            //Update the current scenario scensor
            this._currentScenarioScensor= this.scenarios.get(transitionScenario).sensor;
            
            if (frame === 0) {
                this.fillCellsAccordingToDensity();
            }


            this.updateAmountOfHackedMovables(numberOfHackedMovables);

            //Advance the Transitions Index to the next position
            this._transitionScenariosIndex = this._transitionScenariosIndex + 1;
        }
    }





    /**
     * Save the transitions scenarios array.
     * 
     * @param {Array} scenarios 
     */
    setTransitionScenarios(scenarios) {
        
        this._transitionScenariosArray = scenarios;

    }





}