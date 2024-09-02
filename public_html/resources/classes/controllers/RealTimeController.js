/* 
 * David Sanchez
 * Newcastle University
 * 
 * 2023 Feb 08: Created
 * I have decided to use ES6 (ECMAScript 2015) class declaration rather than ES5 
 * "class className{constructor}" rather than "var className=function()"
 * because:
 * - Even though it is not a real class, VisualStudioCode identifies as a class.
 * - I think that in a near future, I need to change the implementation to full 
 *   prototype based because otherwise I will not have enough performance 
 *   when dealing with large models.
 * - #private variables are almost ready to be used in every browser.
 *   Once approved it will be easier to upates private variables to  hashtag
 * - Private methods have to me simulated in Javascript and all have problems:
 *   WeakMaps: require closure, and internally is the same. Good for node.js.
 *   https://www.sitepoint.com/object-oriented-javascript-deep-dive-es6-classes/)
 *   Symbols: are a hack.
 *   https://exploringjs.com/es6/ch_classes.html
 *   Better keep evertyhing inside the constructor. Once #private available is 
 *   easier to move outside and check if there is a peformance gain.
 * 2021 Apr 14: Update
 * Finished cell idea implementation rather than graph.
 * 2022 Oct 20: update
 * Avergae speed added
 */




/**
 * 
 * This is the RealTime class. 
 * This class tries to simulate a real traffic.
 * The idea is to test if the resilience region is actually useful into 
 * detecting if the system is getting outside of the resilience region.
 * 
 * - This class has the capability of changing between different simulators.
 *   I call these simulators scenarios.
 * - The class reads how many scenario changes I want. I have two structures
 *   to control this scenario changing. The fist structure is an array
 *   of scenario changes in wich each cell saves an object that says to which
 *   scenario is going to change and after which frame. The second structure
 *   just saves a point to each of the simulators that are made with different
 *   scenarios.
 *   e.g. I can have two scenarios: 0 and 1, and I can have 3 changes:
 *   [{scenario:0,frame:0},{scenario:1,frame:50}{scenario:0,frame:100}] 
 * 
 * 
 * - The class has to plot a bar corresponding to the density of the system
 *   after some frames.
 *   For example, system starts then it simulates 60 frames. Then it calculates
 *   the density of the road, searches on the database for the corresponding 
 *   resilience region of the density. The plots an dot for the flow and 
 *   plots the corresponding density in a box. Writes 1 at the bottom.
 * 
 * - I need to specify how many frames I need and when to produce the frame
 *   polling. For example, 1000 frames, polling every 60 frames.
 * 
 * - Vehicles on the beginning of the road should appear randomly at a random
 *   speed. To do so first I need to randomise a speed, then leave the
 *   corresponding amount of space to be able to push the brakes, then 
 *   insert the car.
 * 
 *  
 * 
 * e.g.
 *  
 * Y
 * |   .   .   .   .   .
 * |   .   M   M   M   M  
 * |   M   .   x   .   .  
 * |   .   x   .   x   x  
 * |   x   m   m   m   m  
 * |   m   .   .   .   .  
 * |----------------------X 
 *    t1  t2  t3  t4  t5
 * 
 *  t1 at frame 60
 *  t2 at frame 120
 *  m  Minimum value of the resilience region
 *  M  Maximum value of the resiience region
 *  x Flow of mobile commodities at t polling
 */


/**
 * This object is used to share variables between pages
 * This is a dummy so code will not complain when loading
 */
var _sharedObject;



class RealTimeController {

    /**
     * It receives on the constructor the Stage
     * 
     * @param {Stage} stage 
     */
    constructor() {



        // ========================================================================== //
        // Privileged attributes

        //This variable is defined outside
        _sharedObject = window.opener._sharedObject;

        //Databank
        this.databank = _sharedObject.databank;
        this.simulationId = _sharedObject.simulationId;
        this.numberOfFrames = this.databank.common.numberOfFrames;
        this.config = _sharedObject.config;
        this.colorway = ['#1e90ff', '#b22222', '#6f4d96', '#3d3b72', '#182844'];





        //If _sharedObject.scenario is NaN, this is a combined scenario
        //I need a scenario to calculates the densities, but I need 
        //to know if this is a combined scenario
        this.scenarioId = isNaN(_sharedObject.scenario) ? "0" : _sharedObject.scenario;

        this.scenario = this.databank.scenarios.get(this.scenarioId);

        //Taking the first simulation keys as densities
        this.densities = Array.from(this.scenario.simulation.get("0").keys());

        //Pointer to the real time plot drawing object
        this.realTimeView;





        // ========================================================================== //
        // Private attributes
        // By convention





        //Flag to draw in real time the Frames Collapsible
        this._flagDrawFramesCollapsibleTraffic = false;
        this._flagDrawFramesCollapsibleMovable = false;

        this._closestDensity;

        this._currentDensityResilienceRegionMaxX;
        this._currentDensityResilienceRegionMaxY;
        this._currentDensityResilienceRegionMinX;
        this._currentDensityResilienceRegionMinY;

        //This saves how many frames the real time controller has done in total
        this._currentFrame = 0;

        //There is only one simulator that has scenarios
        this._simulatorRealTime;





        // ========================================================================== //
        // Private methods





        // ========================================================================== //
        // Privileged methods




        this.init();
    }




    // ========================================================================== //
    // Public methods (Prototype methods)





    /**
     * This method starts everything
     */
    init() {

        this.realTimeView = new RealTimeView();

        //Getting the resilience region traces
        const regionTraces = this.scenario.regionTraces;

        //Draw the panels
        if (isNaN(_sharedObject.scenario)) {

            //If _sharedObject.scenario is NaN, this is a combined scenario, so instead of resilience region I put controls to combine scenarios           
            this.realTimeView.drawCollapsibleTransitionScenariosControl();

        } else {
            //If _sharedObject.scenario is NaN, this is a combined scenario, so no resilience region for a particular scenario
            this.realTimeView.drawCollapsibleResilienceRegion(regionTraces);
        }


        this.realTimeView.drawCollapsibleResilienceRegionCombined();
        this.realTimeView.drawCollapsibleAnimation();
        this.createSimulator();


    }





    /**
     * This method starts the real time simulation
     * according to the parameters that are read from the interface
     * 
     * The graphs get progressively slow over time because they are saving
     * all previous points. So, it is wise to set a reasonable limit that will
     * not collapse the software. 
     * 
     */
    run() {

        //Read transitions scenarios list from the user interface
        this.readTransitionScenariosTable();

        //Reference to the simulator engine
        const simulatorRealTime = this._simulatorRealTime;
        const numberOfFrames = this.numberOfFrames;

        //Run the simulator n number of frames
        simulatorRealTime.run(numberOfFrames);

        //Saving the amount of frames elapsed
        this._currentFrame = this._currentFrame + numberOfFrames;


        if (this._flagDrawFramesCollapsibleTraffic) {

            //If true, draw the collapsibles on each simulation.
            //If false, there is significant faster performance
            const frames = simulatorRealTime._frames;
            this.realTimeView.drawCollapsibleHighlightTraffic(frames);
        }


        if (this._flagDrawFramesCollapsibleMovable) {

            //If true, draw the collapsibles on each simulation.
            //If false, there is significant faster performance
            const frames = simulatorRealTime._frames;
            this.realTimeView.drawCollapsibleHighlightMovable(frames);
        }


        //This updates the resilience region and draws it on the screen
        this.calculateResilienceRegionForCurrentFlow(simulatorRealTime.realTime_currentDensity);


        const closestDensity = this._closestDensity;
        const density = Math.round(closestDensity * 100) / 100;

        // closestDensity = (closestDensity * 100) / 100;
        // const density=Number.parseFloat(closestDensity).toFixed(3);

        this.realTimeView.drawDynamicResilienceRegionUpdate(
            simulatorRealTime.totalMovablesCrossedFinishLinePerNFrames,
            this._currentDensityResilienceRegionMaxY,
            this._currentDensityResilienceRegionMinY,
            this._currentFrame,
            density);

        //Reset flow count for next T
        simulatorRealTime.totalMovablesCrossedFinishLinePerNFrames = 0;

        //Saving in the global variable
        this._simulatorRealTime = simulatorRealTime;
    }





    /**
     * Loads the player for the animation
     */
    loadPlayer() {

        const frames = this._simulatorRealTime._frames;

        if (frames.size !== 0) {
            this.realTimeView.animationLoadPlayer(frames);
        }

    }





    /**
     * This method returns the resilience region minimum and maximum
     * values in an array.
     * 
     * It checks the corresponding currentDensity to find the best approximation
     * to the actual density.
     * 
     * The method that uses to find the density is to check the minimum
     * distance to the pre-calculated densities
     * 
     * e.g.
     * 
     * Pre-calculated densities: 
     * 
     *   |------|------|-------|
     *  0.1    0.173  0.337   0.5
     * 
     * Current density = 0.14
     * 
     *  ABS(0.14 - 0.1)   = 0.04
     *  ABS(0.14 - 0.173) = 0.033   Choosen
     *  ABS(0.14 - 0.337) = 0.197
     *  ABS(0.14 - 0.5)   = 0.36
     * 
     *  
     * @param {float} currentDensity 
     */
    calculateResilienceRegionForCurrentFlow(currentDensity) {

        const resilienceRegionArrayMaxX = this.scenario.regionTraces.get("0").x;
        const resilienceRegionArrayMaxY = this.scenario.regionTraces.get("0").y;

        const resilienceRegionArrayMinX = this.scenario.regionTraces.get("1").x;
        const resilienceRegionArrayMinY = this.scenario.regionTraces.get("1").y;

        const densities = this.densities;

        let top = densities.length;

        let closestDensity;
        let smallestDistance;

        let resilienceRegionMaxX;
        let resilienceRegionMaxY;
        let resilienceRegionMinX;
        let resilienceRegionMinY;

        for (let i = 0; i < top; i++) {

            let distance = Math.abs(currentDensity - densities[i]);

            if (smallestDistance === undefined || smallestDistance > distance) {

                //Save the distance and density
                smallestDistance = distance;
                closestDensity = densities[i];
            }
        }

        top = resilienceRegionArrayMaxX.length;

        for (let i = 0; i < top; i++) {

            if (closestDensity === resilienceRegionArrayMaxX[i]) {

                resilienceRegionMaxX = resilienceRegionArrayMaxX[i];
                resilienceRegionMaxY = resilienceRegionArrayMaxY[i];
                resilienceRegionMinX = resilienceRegionArrayMinX[i];
                resilienceRegionMinY = resilienceRegionArrayMinY[i];
            }

        }

        //Saving values
        this._closestDensity = closestDensity;
        this._currentDensityResilienceRegionMaxX = resilienceRegionMaxX;
        this._currentDensityResilienceRegionMaxY = resilienceRegionMaxY;
        this._currentDensityResilienceRegionMinX = resilienceRegionMinX;
        this._currentDensityResilienceRegionMinY = resilienceRegionMinY;
    }





    /**
     * This method receives some parameters and creates an arrays of densities
     * This densities are used to create resilience regions.
     * 
     * e.g. 
     * densityInit=0.01
     * densityEnd=0.5
     * densitySteps=3
     * 
     * returns:
     * [0.01, 0.17333, 0.3366667, 0.5 ]
     * 
     * 
     * @param {float} densityInit 
     * @param {float} densityEnd 
     * @param {integer} densitySteps
     * @return {Array}  floats 
     */
    createDensities(densityInit, densityEnd, densitySteps) {

        //Creating densities range
        const densityStepNoRounded = ((densityEnd - densityInit) / densitySteps);
        // const densityStep = this.round(densityStepNoRounded, 2);
        const densityStep = densityStepNoRounded;

        let myDensities = [];
        let myDensityAccumulator = 0;
        myDensityAccumulator = myDensityAccumulator + densityInit;

        //Creating all density steps
        for (let i = 0; i <= densitySteps; i++) {

            myDensities.push(myDensityAccumulator);
            // myDensityAccumulator = this.round(myDensityAccumulator + densityStep, 2);
            myDensityAccumulator = myDensityAccumulator + densityStep;
        }

        return myDensities;
    }





    /**
     * Creates a simulator.
     * This simulator has different scenarios built from the data of the scenarios
     * supplied.
     * This is necessary because in real time, there has to be a swtiching
     * between scenarios but the state of the road and movables have to be
     * preserved.
     * So, I have to create a scenarios structure to be able to make the 
     * switch between different scenarios.
     */
    createSimulator() {

        //Common data values shared by all simulations
        const myInitialDensity = 0.17333;

        //numberOfRepetitions is about the number of times it runs the simulation with the same parameters. 
        const numberOfRepetitions = 1;
        const numberOfCells = this.databank.common.numberOfCells;
        const initialFramesToDiscard = this.databank.common.initialFramesToDiscard;
        const movableMaxVelocity = this.databank.common.movableMaxSpeed;
        const movablePerformanceHighLimit = this.databank.common.movablePerformanceHighLimit;
        const movablePerformanceLowLimit = this.databank.common.movablePerformanceLowLimit;
        const numberOfScenarios = this.databank.common.numberOfScenarios;
        const realTimeMode = true;
        const scenarios = new Map();


        //Creating scenarios
        for (let i = 0; i < numberOfScenarios; i++) {

            let scenario = this.databank.scenarios.get(i.toString());
            let numberOfHackedMovables = scenario.numberOfHackedMovables;
            let probabilityRandomBrakeUniform = scenario.probabilityRandomBrakeUniform;
            let probabilityRandomBrakeMultiple = scenario.probabilityRandomBrakeMultiple;
            let probabilityRandomBrakeArray = scenario.probabilityRandomBrakeArray;


            //These are normal simulations that have one scenario per simulation
            //Real time simulationrs may have one or more scenario per simulation
            let myScenario = new Scenario(
                probabilityRandomBrakeUniform,
                probabilityRandomBrakeMultiple,
                probabilityRandomBrakeArray,
                numberOfHackedMovables,
                numberOfRepetitions
            );

            scenarios.set(i.toString(), myScenario);
        }

        this._simulatorRealTime = new Simulator(
            numberOfCells,
            myInitialDensity,
            initialFramesToDiscard,
            movablePerformanceHighLimit,
            movablePerformanceLowLimit,
            movableMaxVelocity,
            scenarios,
            realTimeMode
        );
    }





    /**
     * This refreshes the configuration
     */
    updateConfig() {
        this.config = _sharedObject.config;
    }





    /**
     * This methods incrases the density on the road.
     * It adds a movable.
     */
    increaseDensity() {

        this._simulatorRealTime.realTimeMode_addMovable();
        this._simulatorRealTime.realTimeMode_calculateCurrentDensity();

    }





    /**
     * This methods decreases the density on the road.
     * It deletes a movable
     */
    decreaseDensity() {

        this._simulatorRealTime.realTimeMode_deleteMovable();
        this._simulatorRealTime.realTimeMode_calculateCurrentDensity();

    }





    /**
     * Update the collapsibles that show the frames Traffic
     */
    SetFlagToDrawCollapsibleFramesTraffic() {

        //Subsequent simulations will be drawn on the collapsible
        this._flagDrawFramesCollapsibleTraffic = true;

        //Update view
        const frames = this._simulatorRealTime._frames;
        this.realTimeView.drawCollapsibleHighlightTraffic(frames);
    }





    /**
     * Update the collapsibles that show the frames Movable
     */
    SetFlagToDrawCollapsibleFramesMovable() {

        //Subsequent simulations will be drawn on the collapsible
        this._flagDrawFramesCollapsibleMovable = true;

        //Update view
        const frames = this._simulatorRealTime._frames;
        this.realTimeView.drawCollapsibleHighlightMovable(frames);
    }





    /** 
     * Update the collapsibles that show the frames
     */
    SetFlagNotToDrawCollapsibleFrames() {

        //Subsequent simulations will not be drawn on the collapsible
        this.flagDrawFramesCollapsible = false;
    }





    /**
     * This method starts the real time simulation
     * according to the parameters that are read from the interface
     * 
     * The graphs get progressively slow over time because they are saving
     * all previous points. So, it is wise to set a reasonable limit that will
     * not collapse the software. 
     * 
     */
    runVariableDensity() {


        let i = 0;
        let interval = setInterval(() => {




            //======================================
            this.run();



            //Increase or decrease the density randomly
            const decider = (Math.random());

            if (decider > 0.6) {
                this.increaseDensity();
            } else if (decider < 0.3) {
                this.decreaseDensity();
            }

            //==================================


            i = i + 1;

            if (i === 50) clearInterval(interval);
        }, 500);














    }





    /**
     * Reads the transition scenarios interface and produces a 
     * data model of the scenarios.
     */
    readTransitionScenariosTable() {

        //Deletes the structure before filling it again
        const scenariosTransitionsArray = new Array();

        const numberOfTransitions = this.realTimeView.currentScenarioRow;

        for (let i = 0; i < numberOfTransitions; i++) {

            let myTransitionScenario = parseInt(document.getElementById("transitionScenario" + i).value);
            let myTransitionFrame = parseInt(document.getElementById("transitionFrame" + i).value);


            let myTransition = {
                "transitionScenario": myTransitionScenario,
                "transitionFrame": myTransitionFrame
            }

            scenariosTransitionsArray.push(myTransition);
        }


        //Sends the information collected to the simulator for processing
        this._simulatorRealTime.setTransitionScenarios(scenariosTransitionsArray);

    }





}

var realTime = new RealTimeController();