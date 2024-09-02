/** 
 * David Sanchez
 * Newcastle University
 * 
 * 2022 Mar 02: Created
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
 * 2022 Apr 11: Update
 * Recreated into an object so it is easier to maintain
 * 
 */



/**
 * TODO Delete this part
 * This object is used to share variables between pages
 */
var _sharedObject;



/**
 * This class starts the object creation and the simulation
 */
class SimulationController {


    /**
     * 
     */
    constructor() {


        // ========================================================================== //
        // Privileged attributes





        //Getting the data collected in the previous window
        //Javascript objects are shared by reference
        //In order to always get the same parameters, I am passing a UUID
        //as the name of the window. This window name is unmutable.
        //Then I search on the _sharedObject for the parameters store for that
        //UUID. This is like a simulated cookie on client side
        _sharedObject = window.opener._sharedObject;
        this._uuid = window.name;
        this.databank = _sharedObject.parameters.get(this._uuid);
        this.id = this.databank.common.id;

        //Internal structures
        this.simulationView;

        //Exporting plot drawings configuration
        this.config = {
            responsive: true,
            toImageButtonOptions: {
                format: 'svg', // one of png, svg, jpeg, webp
                filename: 'custom_image',

                //height: "", //Dynamic screen size
                //width: "", //Dynamic screen size

                //Square illustrations
                //height: 500, //Produce exports or the same size
                //width: 700, //Produce exports or the same size

                //Panoramic illustrations
                //height: 400, //Produce exports or the same size
                //width: 1200, //Produce exports or the same size

                scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
            }
        };






        // ========================================================================== //
        // Private attributes
        // By convention

        this._realTimeSimulationId = 1;
        this._simulationId = 1;;
        this._gui = new GUI();

        //Interface structures
        let _plotDownloadOptions = [];





        // ========================================================================== //
        // Private methods





        /**
          * This private method creates the plot download options menu
          */
        var createDownloadOptionsMenu = function () {






            /**
                * This method pushes plot Download elements into the plotDownloadOptions queue
                * @param {type} element
                * @returns {undefined}
                */
            var plotDownloadOptionsMenuPush = function (element) {

                _plotDownloadOptions.push(element);

                //It pushes the element to the menu
                plotDownloadOptionsMenuCreate(element);
            };





            /**
             * This  method creates one sample menu
             * 
             * @param {type} option
             * @returns {undefined}
             */
            var plotDownloadOptionsMenuCreate = function (option) {

                //It attaches an event handler for the "select sample" menu
                let paragraphElement = document.getElementById('plotDownloadOptions_dropdown');

                //creating the menu item
                let myMenuItem = document.createElement("option");
                myMenuItem.setAttribute("value", option.id);
                myMenuItem.text = option.description;

                /*Append the menu item*/
                paragraphElement.appendChild(myMenuItem);
            };





            /**
             * This method handles events received from the select menu when loading a sample policy
             * 
             * @returns {undefined}
             */
            var plotDownloadOptionsMenuHandleSelect = function () {

                //Selected index
                let selIndex = this.selectedIndex;

                //Finds the textSample corresponding to the selected value
                let option = _plotDownloadOptions[selIndex];

                // let x = window.confirm("Are you sure you want to load " + selIndex + "?");

                //Updates the interface with the options
                plotDownloadOptionsMenuSetValues(option);

            };





            /**
            * This method sets the interface with a JSON object.
            * 
            * @param {JSON} parameters 
            */
            var plotDownloadOptionsMenuSetValues = function (parameters) {

                workbench.config.toImageButtonOptions.width = parameters.width
                workbench.config.toImageButtonOptions.height = parameters.height;

            }





            //It attaches an event handler for the "select sample" menu
            if (document.getElementById('plotDownloadOptions_dropdown') != null)
                document.getElementById('plotDownloadOptions_dropdown').addEventListener('change', plotDownloadOptionsMenuHandleSelect, false);


            let myPlotOption1 = {
                "id": 0,
                "description": "Relative to Window size",
                "width": "",
                "height": ""
            }
            plotDownloadOptionsMenuPush(myPlotOption1);

            let myPlotOption2 = {
                //Produce exports for square illustrations.
                "id": 1,
                "description": "Square illustrations (700x500)",
                "width": 700,
                "height": 500
            }
            plotDownloadOptionsMenuPush(myPlotOption2);

            let myPlotOption3 = {
                //Produce exports for wide illustrations
                "id": 2,
                "description": "Panoramic illustrations (1200x400)",
                "width": 1200,
                "height": 400
            }
            plotDownloadOptionsMenuPush(myPlotOption3);



            //Set default
            document.getElementById('plotDownloadOptions_dropdown').selectedIndex = 0;

        }





        /**
         * This method inits the Workbench ataching interface elements to methods
         */
        var initInterface = function () {

            //Creates menus
            createDownloadOptionsMenu();

        };





        // ========================================================================== //
        // Privileged methods







        //Init the workbench
        initInterface();
        this.init();
    }





    // ========================================================================== //
    // Public methods (Prototype methods)




    /**
     * It starts all the init of the object
     */
    init() {


        //Window title
        //Changing the tab and title to make it easier to identify which iteration the user is seeing
        document.title = "Simulation " + this.id;
        document.getElementById("simulationTitle").innerHTML = "Simulation " + this.id;




        this.writeInterface();
        this.createSimulations();
        this.calculateResilienceIndex();
        this.drawResults();


    }






    /**
     *  This method writes back to the interface using a JSON object with the values.
     * 
     */

    writeInterface() {

        //Common to control simulations and attack simulations
        const numberOfCells = this.databank.common.numberOfCells;
        document.getElementById("numberOfCells").value = numberOfCells;
        document.getElementById("numberOfFrames").value = this.databank.common.numberOfFrames;

        document.getElementById("framesDiscard").value = this.databank.common.initialFramesToDiscard;
        document.getElementById("densityInit").value = this.databank.common.densityInit;
        document.getElementById("densityEnd").value = this.databank.common.densityEnd;
        document.getElementById("densitySteps").value = this.databank.common.densitySteps;

        document.getElementById("plotMaximumYValue").value = this.databank.common.plotMaximumYValue;
        document.getElementById("plotMinimumYValue").value = this.databank.common.plotMinimumYValue;

        document.getElementById("movableMaxSpeed").value = this.databank.common.movableMaxSpeed;
        document.getElementById("movablePerformanceHighLimit").value = this.databank.common.movablePerformanceHighLimit;
        document.getElementById("movablePerformanceLowLimit").value = this.databank.common.movablePerformanceLowLimit;

        const numberOfScenarios = this.databank.common.numberOfScenarios;
        document.getElementById("numberOfScenarios").value = numberOfScenarios;



        //Create the collapsibles
        this.createScenarios();



        //Write collapsibles
        for (let i = 0; i < numberOfScenarios; i++) {

            let myScenario = this.databank.scenarios.get(i);

            document.getElementById("numberOfSimulations.Scenario" + i).value = myScenario.numberOfSimulations;
            document.getElementById("numberOfHackedMovables.Scenario" + i).value = myScenario.numberOfHackedMovables;
            document.getElementById("probabilityRandomBrakeUniform.Scenario" + i).value = myScenario.probabilityRandomBrakeUniform;


            let probabilityRandomBrakeMultiple = myScenario.probabilityRandomBrakeMultiple;
            document.getElementById("radioProbabilityRandomBrakeMultiple.Scenario" + i).checked = probabilityRandomBrakeMultiple;


            if (probabilityRandomBrakeMultiple === true) {
                //Array structure with probabilities of random Brakes

                //Create cells
                const fieldNamePrefix = "probabilityCell.Scenario" + i;
                const container = document.getElementById("probabilityRandomBrakeMultipleScroll.Scenario" + i);

                this.createMultipleProbabilityRandomBrakeInputFields(container, numberOfCells, myScenario.uniformValue, fieldNamePrefix, myScenario.probabilityRandomBrakeArray);
            }
        }
    }





    /**
     * Creates the same simulation for two different parameters.
     * One of the correspond to the parameters of control, the other to the parameters
     * of attack
     */
    createSimulations() {


        const numberOfCells = this.databank.common.numberOfCells;
        const numberOfFrames = this.databank.common.numberOfFrames;
        const initialFramesToDiscard = this.databank.common.initialFramesToDiscard;
        const densityInit = this.databank.common.densityInit;
        const densityEnd = this.databank.common.densityEnd;
        const densitySteps = this.databank.common.densitySteps;
        const movableMaxSpeed = this.databank.common.movableMaxSpeed;
        const performanceHighLimit = this.databank.common.movablePerformanceHighLimit;
        const performanceLowLimit = this.databank.common.movablePerformanceLowLimit;
        const numberOfScenarios = this.databank.common.numberOfScenarios;

        const scenarios = this.databank.scenarios;





        //!=======================Working here
        //TODO This is overengineered. I have to make only one sensor per
        //TODO scenario. Otherwise, I have to duplicate information inside the
        //TODO sensor that is already on each scenario.
        //Sensor
        const mySensor = new Sensor();

        //Adding scenarios to the sensor
        for (let i = 0; i < numberOfScenarios; i++) {

            let myScenario = scenarios.get(i);

            let probabilityRandomBrakeUniform = myScenario.probabilityRandomBrakeUniform;
            let probabilityRandomBrakeMultiple = myScenario.probabilityRandomBrakeMultiple;
            let probabilityRandomBrakeArray = myScenario.probabilityRandomBrakeArray;

            mySensor.addScenario(i,
                probabilityRandomBrakeUniform,
                probabilityRandomBrakeMultiple,
                probabilityRandomBrakeArray);


            mySensor.setScenario(i);


            const mySimulation = this.createSimulation(
                numberOfCells,
                numberOfFrames,
                initialFramesToDiscard,
                densityInit,
                densityEnd,
                densitySteps,
                movableMaxSpeed,
                performanceHighLimit,
                performanceLowLimit,
                myScenario.numberOfSimulations,
                myScenario.numberOfHackedMovables,
                mySensor
            )


            //Saving simulation
            myScenario.simulation = mySimulation;




        }


        //Storing a fast reference to the sensor
        this.databank.common.sensor = mySensor;

        //!=======================Working here











    }





    /**
     * This method creates the simulations with different densities
     */
    createSimulation(
        numberOfCells,
        numberOfFrames,
        initialFramesToDiscard,
        densityInit,
        densityEnd,
        densitySteps,
        movableMaxVelocity,
        performanceHighLimit,
        performanceLowLimit,
        numberOfSimulations,
        numberOfHackedMovables,
        sensor) {


        //New simlations map to store all runnings
        const mySimulations = new Map();

        //Creating densities range
        const densityStepNoRounded = ((densityEnd - densityInit) / densitySteps);
        // const densityStep = this.round(densityStepNoRounded, 2);
        const densityStep = densityStepNoRounded;

        const realTimeMode = false;

        let myDensities = [];
        let myDensityAccumulator = 0;
        myDensityAccumulator = myDensityAccumulator + densityInit;

        //Creating all density steps
        for (let i = 0; i <= densitySteps; i++) {

            myDensities.push(myDensityAccumulator);
            // myDensityAccumulator = this.round(myDensityAccumulator + densityStep, 2);
            myDensityAccumulator = myDensityAccumulator + densityStep;
        }


        //Creating the simulations(iterations)
        for (let i = 0; i < numberOfSimulations; i++) {

            //Creating a map to store each iteration of the simulation.
            //Each iteration has one or more densities
            let myNthSimulation = new Map();

            //Creating all simulations with the given densities
            for (let j = 0; j < myDensities.length; j++) {

                // Scenario 1. Between the ranges of the simulation
                let mySimulator = new Simulator(
                    numberOfCells,
                    myDensities[j],
                    initialFramesToDiscard,
                    performanceLowLimit,
                    performanceHighLimit,
                    sensor,
                    movableMaxVelocity,
                    numberOfHackedMovables,
                    realTimeMode
                );

                //Getting the simulation results, which is a Map.
                let mySimulationResult = mySimulator.run(numberOfFrames);

                //Saving the simulation into a Map
                myNthSimulation.set(myDensities[j], mySimulationResult);
            }

            //Storing the simulation with all other iterations
            mySimulations.set(i, myNthSimulation);
        }

        return mySimulations;
    }





    /**
     * This method calculates the resilience index for the flow.
     * It takes into consideration the common resilience region.
     */
    calculateResilienceIndex() {


        //Getting references
        const numberOfScenarios = this.databank.common.numberOfScenarios;

        for (let i = 0; i < numberOfScenarios; i++) {



            let mySimulation = this.databank.scenarios.get(i).simulation;
            let myRegionTraces = this.calculateResilienceRegion(mySimulation, "Max.Scenario" + i, "Min.Scenario" + i);


            this.databank.scenarios.get(i).regionTraces = myRegionTraces;


            //Placing Max into a Map for easy finding values
            const myRegionMaxMap = new Map();
            const topMax = myRegionTraces.get(0).x.length;
            for (let i = 0; i < topMax; i++) {
                myRegionMaxMap.set(
                    myRegionTraces.get(0).x[i],
                    myRegionTraces.get(0).y[i],
                )
            }

            //Placing Min into a Map for easy finding values
            const myRegionMinMap = new Map();
            const topMin = myRegionTraces.get(1).x.length;
            for (let i = 0; i < topMin; i++) {
                myRegionMinMap.set(
                    myRegionTraces.get(1).x[i],
                    myRegionTraces.get(1).y[i],
                )
            }




            const top = mySimulation.size;

            for (let i = 0; i < top; i++) {

                let mySimulationIteration = mySimulation.get(i);

                //Iterating the map
                for (const [density, simulatorResult] of mySimulationIteration) {

                    simulatorResult.resilienceFlowBoundaryRegionMax = myRegionMaxMap.get(density);
                    simulatorResult.resilienceFlowBoundaryRegionMin = myRegionMinMap.get(density);

                    simulatorResult.resilienceFlowIndexMax = simulatorResult.totalMovablesCrossedFinishLine /
                        simulatorResult.resilienceFlowBoundaryRegionMax;

                    simulatorResult.resilienceFlowIndexMin = simulatorResult.totalMovablesCrossedFinishLine /
                        simulatorResult.resilienceFlowBoundaryRegionMin;
                }
            }


        }





        //Storing the results of the simulation into the databank
        // const simulationControl = this.databank.control.simulations;
        // const simulationAttack = this.databank.attack.simulations;

        // const myControlRegionTraces = this.calculateResilienceRegion(simulationControl, "Max", "Min");
        // const myAttackRegionTraces = this.calculateResilienceRegion(simulationAttack, "Max attack", "Min attack");


        // this.databank.control.controlRegionTraces = myControlRegionTraces;
        // this.databank.attack.attackRegionTraces = myAttackRegionTraces;



        // //Placing Max into a Map for easy finding values
        // const myControlRegionMaxMap = new Map();
        // const topMax = myControlRegionTraces.get(0).x.length;
        // for (let i = 0; i < topMax; i++) {
        //     myControlRegionMaxMap.set(
        //         myControlRegionTraces.get(0).x[i],
        //         myControlRegionTraces.get(0).y[i],
        //     )
        // }

        // //Placing Min into a Map for easy finding values
        // const myControlRegionMinMap = new Map();
        // const topMin = myControlRegionTraces.get(1).x.length;
        // for (let i = 0; i < topMin; i++) {
        //     myControlRegionMinMap.set(
        //         myControlRegionTraces.get(1).x[i],
        //         myControlRegionTraces.get(1).y[i],
        //     )
        // }





        // //Control
        // const topControl = simulationControl.size;

        // for (let i = 0; i < topControl; i++) {

        //     let mySimulation = simulationControl.get(i);

        //     //Iterating the map
        //     for (const [density, simulatorResult] of mySimulation) {

        //         simulatorResult.resilienceFlowBoundaryRegionMax = myControlRegionMaxMap.get(density);
        //         simulatorResult.resilienceFlowBoundaryRegionMin = myControlRegionMinMap.get(density);

        //         simulatorResult.resilienceFlowIndexMax = simulatorResult.totalMovablesCrossedFinishLine /
        //             simulatorResult.resilienceFlowBoundaryRegionMax;

        //         simulatorResult.resilienceFlowIndexMin = simulatorResult.totalMovablesCrossedFinishLine /
        //             simulatorResult.resilienceFlowBoundaryRegionMin;
        //     }
        // }





        // //Attack
        // const topAttack = simulationAttack.size;

        // for (let i = 0; i < topAttack; i++) {

        //     let mySimulation = simulationAttack.get(i);

        //     //Iterating the map
        //     for (const [density, simulatorResult] of mySimulation) {

        //         simulatorResult.resilienceFlowBoundaryRegionMax = myControlRegionMaxMap.get(density);
        //         simulatorResult.resilienceFlowBoundaryRegionMin = myControlRegionMinMap.get(density);

        //         simulatorResult.resilienceFlowIndexMax = simulatorResult.totalMovablesCrossedFinishLine /
        //             simulatorResult.resilienceFlowBoundaryRegionMax;

        //         simulatorResult.resilienceFlowIndexMin = simulatorResult.totalMovablesCrossedFinishLine /
        //             simulatorResult.resilienceFlowBoundaryRegionMin;
        //     }
        // }
    }





    /**
     * This method calculates the resilience reigion numerically.
     */
    calculateResilienceRegion(simulations, maxTag, minTag) {

        const topSimulations = simulations.size;
        const traces = new Map();

        //Create a new object trace to store results to be collected

        const myTraceMax = {
            x: new Array(),
            y: new Array(),
            name: maxTag,
        };

        const myTraceMin = {
            x: new Array(),
            y: new Array(),
            name: minTag,
        };

        for (let i = 0; i < topSimulations; i++) {

            //Getting each iteration of a simulation
            let simulation = simulations.get(i);
            let densities = Array.from(simulation.keys());

            let topDensities = densities.length;





            for (let j = 0; j < topDensities; j++) {

                //Traversing all densities in a simulation
                let totalMovablesCrossedFinishLine = simulation.get(densities[j]).totalMovablesCrossedFinishLine;

                if (typeof myTraceMax.y[j] === 'undefined') {

                    myTraceMax.x.push(densities[j]);
                    myTraceMax.y.push(totalMovablesCrossedFinishLine);

                } else if (totalMovablesCrossedFinishLine > myTraceMax.y[j]) {

                    myTraceMax.y[j] = totalMovablesCrossedFinishLine;
                }




                if (typeof myTraceMin.y[j] === 'undefined') {

                    myTraceMin.x.push(densities[j]);
                    myTraceMin.y.push(totalMovablesCrossedFinishLine);

                } else if (totalMovablesCrossedFinishLine < myTraceMin.y[j]) {

                    myTraceMin.y[j] = totalMovablesCrossedFinishLine;
                }


            }

            //Adding the new series to the traces using the iteration i as key
            traces.set(0, myTraceMax);
            traces.set(1, myTraceMin);

        }

        return traces;
    }





    /**
     * 
     * This prototype method draw the results
     * 
     */
    drawResults() {

        this.simulationView = new SimulationView(this.id, this.databank, this.config);
        this.simulationView.drawResults();
    }





    /**
     * 
     * This prototype method starts everything 
     * To do so, it initialises most of the parameters required to start a simulation
     * 
     */
    run() {

        // TODO delete this because, read interface was supposed to be done on the workbench
        // this.readInterface();


        this.createSimulations();
        this.calculateResilienceIndex();
        this.drawResults();
    }





    /**
     * 
     * This prototype method saves current dataset.
     * 
     * It has to download text as a blob because it is too large to do it with 
     * a.href = 'data:application/csv;charset=utf-8,' + encodeURIComponent(myWorkbenchDataBank);
     * 
     * 
     * Based on this site:
     * 
     * https://www.bennadel.com/blog/3472-downloading-text-using-blobs-url-createobjecturl-and-the-anchor-download-attribute-in-javascript.htm
     * 
     * https://stackoverflow.com/questions/70732624/how-to-download-url-from-createobjecturl-and-save-it-in-a-folder
     */
    save() {

        if (typeof this.databank !== 'undefined') {

            //Actually, it is not needed to stringify the data first, because I am saving using Blob
            //Stringify uses a recursive method to handle maps.
            //This is very memory intensive and does not work for large objects.
            //Only activate this option for debugging small objects
            // const myWorkbenchDataBank = this.workbenchDataBank.toString();

            const myWorkbenchDataBank = this.databank;

            //It appends the element to a document model to save it, using the appropriate encoding set
            //I had to download it as a blob because the size is too large.
            const blob = new Blob(
                [myWorkbenchDataBank], //Blob parts
                { type: "text/plain;charset=utf-8" }
            );

            const downloadURL = URL.createObjectURL(blob);

            const output = document.createElement('a');
            output.href = downloadURL;
            output.target = '_blank';
            output.download = 'CompRes.txt';

            //It forces a download
            // document.body.appendChild(output);
            output.click();

            //This releases the resource for another download
            URL.revokeObjectURL(output.href);

        }
    }





    // /**
    //  * This prototype method download the datasets.
    //  * 
    //  * The datasets are basically text file in which there is a minified JSON object.
    //  * They are large in size because they are plain text.
    //  * I compressed them in zip and I am distributing them with the source code.
    //  * 
    //  * They have to be downloaded first, then unzip and then uploaded again because:
    //  * - Compressed they are small but uncompressed are too large to be hosted in
    //  *   github cheapily
    //  * - I cannot uncompressed them on the fly in the webpage because thre are no
    //  *   .zip uncompressors that work in Javascript at this moment.
    //  * 
    //  * Datasets are just a run of Sample 1, Sample 2 and Sample 3. 
    //  * Due to the nature of the simulator, it is unlikely that you will get the same
    //  * simulation if you run those samples again. So, in order to produce the article
    //  * I needed to have a stable simulation to do the illustrations and analsyis. 
    //  *
    //  * 
    //  * 
    //  */
    // downloadDatasets() {



    //     const datasets = document.createElement('a');
    //     datasets.setAttribute("href", "../datasets/datasets.zip");
    //     datasets.setAttribute("download", "datasets.zip");
    //     datasets.setAttribute("target", "_blank");
    //     datasets.click();
    // }





    //TODO  This method should go to commons because it is a GUI used in worbenchs and simulator
    /**
     * This method creates as much entry fields as it is indicated in the 
     * number of cells input field and adds it to the scrollable panel.
     * 
     * This method is used in two ways.
     * First, when interacting with the interface and when loading a saved
     * simulation into the program
     * 
         * 
         * @param {DOM} container 
         */
    createMultipleProbabilityRandomBrakeInputFields(container, numberOfCells, uniformValue, fieldNamePrefix, probabilityRandomBrakeArray) {

        //Removing previous input elments
        container.innerHTML = '';

        for (let i = 0; i < numberOfCells; i++) {

            let mySpan = document.createElement("span");
            mySpan.setAttribute("class", "labelScroll");
            mySpan.innerHTML = i;

            let myInputField = document.createElement("input");
            myInputField.setAttribute("class", "input");
            myInputField.setAttribute("type", "text");
            myInputField.setAttribute("id", fieldNamePrefix + ".cell" + i);

            //Prefilling the input field

            if (typeof probabilityRandomBrakeArray !== 'undefined') {
                myInputField.value = probabilityRandomBrakeArray[i];
            } else {
                myInputField.value = uniformValue;
            }

            //Adding the field to the scrollable element
            container.append(mySpan);
            container.append(myInputField);
        }

        //Display panel
        container.style.display = "block";
    }




    /**
     * 
     * This prototype method opens a new window that will show
     * a real time simulation.
     * 
     * It only opens the new window and sets some global 
     * variables that will be used by the new window.
     * Then all methods will be run in the context of the new window which
     * should be a new thread/process.
     * 
     */
    createRealTimeViewer(simulationId, scenario) {

        const myURL = 'realTime.html';

        _sharedObject.scenario = scenario;
        _sharedObject.simulationId = simulationId;
        _sharedObject.realTimeSimulationId = this._realTimeSimulationId;
        _sharedObject.databank = this.databank;

        //Opening the window. Title will be set once window is opened
        window.open(myURL, "_blank");

        //Increases the counter for another simulation
        this._realTimeSimulationId = this._realTimeSimulationId + 1;

    }







    //TODO This should be moved to GUI
    /**
     * This method creates the scenarios.
     * It reads from the interface how many it needs to creates.
     * 
     * Then it calls a common GUI method to draw collapsible
     */
    createScenarios() {

        const container = document.getElementById('scenarios');

        //Common to control simulations and attack simulations
        const numberOfScenarios = parseInt(document.getElementById("numberOfScenarios").value);

        //Delete previous entries
        container.innerHTML = "";

        for (let i = 0; i < numberOfScenarios; i++) {

            let contentID = "scenario" + i;
            let panelName = "panelScenario" + i;
            let panelLabel = "Scenario " + i;
            let panelLegend = "Scenario " + i;


            this._gui.collapsiblesCreateOne(container, contentID, panelName, panelLabel, panelLegend)

            let contentPanel = document.getElementById(panelName);

            this.createScenarioCollapsible(contentPanel, i);
            this.assignRadioBehaviour(i);

        }


        this._gui.collapsiblesAssignBehaviour();
    }





    //TODO Check if this should be moved to GUI
    /**
     * This method create one scenario collapsible
     */
    createScenarioCollapsible(container, id) {





        //Number of simulations
        const mySpanNumberOfSimulations = document.createElement("span");
        mySpanNumberOfSimulations.setAttribute("class", "label2");
        mySpanNumberOfSimulations.innerHTML = "Number of Simulations [Recommended 100]";

        const myInputFieldNumberOfSimulations = document.createElement("input");
        myInputFieldNumberOfSimulations.setAttribute("class", "input");
        myInputFieldNumberOfSimulations.setAttribute("type", "text");
        myInputFieldNumberOfSimulations.setAttribute("id", "numberOfSimulations.Scenario" + id);

        container.append(mySpanNumberOfSimulations);
        container.append(myInputFieldNumberOfSimulations);
        container.append(document.createElement("br"));





        //Number of hacked movables
        const mySpanNumberOfHackedMovables = document.createElement("span");
        mySpanNumberOfHackedMovables.setAttribute("class", "label2");
        mySpanNumberOfHackedMovables.innerHTML = "Number of Hacked Movables [Recommended 0,1,...]";

        const myInputFieldNumberOfHackedMovables = document.createElement("input");
        myInputFieldNumberOfHackedMovables.setAttribute("class", "input");
        myInputFieldNumberOfHackedMovables.setAttribute("type", "text");
        myInputFieldNumberOfHackedMovables.setAttribute("id", "numberOfHackedMovables.Scenario" + id);

        container.append(mySpanNumberOfHackedMovables);
        container.append(myInputFieldNumberOfHackedMovables);
        container.append(document.createElement("br"));





        //Probability Random Brake section
        const mySpanProbabilityRandomBrake = document.createElement("span");
        mySpanProbabilityRandomBrake.setAttribute("class", "label2");
        mySpanProbabilityRandomBrake.innerHTML = "Probability Random Brake [Recommended 0.1+]";

        const myInputRadioProbabilityRandomBrakeUniform = document.createElement("input");
        myInputRadioProbabilityRandomBrakeUniform.setAttribute("class", "inputRadio");
        myInputRadioProbabilityRandomBrakeUniform.setAttribute("type", "radio");
        myInputRadioProbabilityRandomBrakeUniform.setAttribute("id", "radioProbabilityRandomBrakeUniform.Scenario" + id);
        myInputRadioProbabilityRandomBrakeUniform.setAttribute("name", "probabilityRandomBrake.Scenario" + id);
        myInputRadioProbabilityRandomBrakeUniform.setAttribute("checked", true);

        const myLabelProbabilityRandomBrakeUniform = document.createElement("label");
        myLabelProbabilityRandomBrakeUniform.setAttribute("class", "labelRadio");
        myLabelProbabilityRandomBrakeUniform.setAttribute("for", "labelProbabilityRandomBrakeUniform.Scenario" + id);
        myLabelProbabilityRandomBrakeUniform.innerHTML = "Uniform";




        const myInputFieldProbabilityRandomBrakeUniform = document.createElement("input");
        myInputFieldProbabilityRandomBrakeUniform.setAttribute("class", "input");
        myInputFieldProbabilityRandomBrakeUniform.setAttribute("type", "text");
        myInputFieldProbabilityRandomBrakeUniform.setAttribute("id", "probabilityRandomBrakeUniform.Scenario" + id);






        const mySpanProbabilityRandomBrakeMultiple = document.createElement("span");
        mySpanProbabilityRandomBrakeMultiple.setAttribute("class", "label2");

        const myInputRadioProbabilityRandomBrakeMultiple = document.createElement("input");
        myInputRadioProbabilityRandomBrakeMultiple.setAttribute("class", "inputRadio");
        myInputRadioProbabilityRandomBrakeMultiple.setAttribute("type", "radio");
        myInputRadioProbabilityRandomBrakeMultiple.setAttribute("id", "radioProbabilityRandomBrakeMultiple.Scenario" + id);
        myInputRadioProbabilityRandomBrakeMultiple.setAttribute("name", "probabilityRandomBrake.Scenario" + id);

        const myLabelProbabilityRandomBrakeMultiple = document.createElement("label");
        myLabelProbabilityRandomBrakeMultiple.setAttribute("class", "labelRadio");
        myLabelProbabilityRandomBrakeMultiple.setAttribute("for", "probabilityRandomBrakeMultiple.Scenario" + id);
        myLabelProbabilityRandomBrakeMultiple.innerHTML = "Multiple";


        const mySpanScrollProbabilityRandomBrakeMultiple = document.createElement("span");
        mySpanScrollProbabilityRandomBrakeMultiple.setAttribute("class", "label2");

        const myScrollProbabilityRandomBrakeMultiple = document.createElement("div");
        myScrollProbabilityRandomBrakeMultiple.setAttribute("class", "scroll");
        myScrollProbabilityRandomBrakeMultiple.setAttribute("id", "probabilityRandomBrakeMultipleScroll.Scenario" + id);








        container.append(mySpanProbabilityRandomBrake);
        container.append(myInputRadioProbabilityRandomBrakeUniform);
        container.append(myLabelProbabilityRandomBrakeUniform);
        container.append(myInputFieldProbabilityRandomBrakeUniform);
        container.append(document.createElement("br"));

        container.append(mySpanProbabilityRandomBrakeMultiple);
        container.append(myInputRadioProbabilityRandomBrakeMultiple);
        container.append(myLabelProbabilityRandomBrakeMultiple);
        container.append(document.createElement("br"));

        container.append(mySpanScrollProbabilityRandomBrakeMultiple);
        container.append(myScrollProbabilityRandomBrakeMultiple);
        container.append(document.createElement("br"));








        //Prefilling the input field

        // if (typeof probabilityRandomBrakeArray !== 'undefined') {
        //     myInputField.value = probabilityRandomBrakeArray[i];
        // } else {
        //     myInputField.value = uniformValue;
        // }

        //Adding the field to the scrollable element
        // container.append(mySpanNumberOfSimulations);
        // container.append(myInputFieldNumberOfSimulations);








    }






    //TODO I think, this probably should be moved to GUI
    /**
     * This method assigns the behaviour of the radio buttons
     */
    assignRadioBehaviour(id) {




        const radioButtonUniform = document.getElementById("radioProbabilityRandomBrakeUniform.Scenario" + id);

        radioButtonUniform.addEventListener('click', function (event) {
            if (event.target && event.target.matches("input[type='radio']")) {

                //Enable uniform value
                document.getElementById("probabilityRandomBrakeUniform.Scenario" + id).disabled = false;

                //Enable multiple value
                document.getElementById("probabilityRandomBrakeMultipleScroll.Scenario" + id).style.display = "none";
            }
        })




        const radioButtonMultiple = document.getElementById("radioProbabilityRandomBrakeMultiple.Scenario" + id);

        radioButtonMultiple.addEventListener('click', function (event) {
            if (event.target && event.target.matches("input[type='radio']")) {

                //Disable uniform value
                document.getElementById("probabilityRandomBrakeUniform.Scenario" + id).disabled = true;


                const container = document.getElementById("probabilityRandomBrakeMultipleScroll.Scenario" + id);
                const numberOfCells = parseInt(document.getElementById("numberOfCells").value);
                const uniformValue = document.getElementById("probabilityRandomBrakeUniform.Scenario" + id).value;
                const fieldNamePrefix = "probabilityCell.Scenario" + id;


                //Dynamically create additional entry fields
                simulation.createMultipleProbabilityRandomBrakeInputFields(container, numberOfCells, uniformValue, fieldNamePrefix);


                //Enable multiple value
                document.getElementById("probabilityRandomBrakeMultipleScroll.Scenario" + id).style.display = "block";



                //Updating the size of the collapsible
                const content = document.getElementById("scenario" + id);
                content.style.maxHeight = content.scrollHeight + "px";

            }
        })
    }





    /**
     * 
     * This prototype method opens a new window that will show
     * a real time simulation.
     * 
     * It only opens the new window and sets some global 
     * variables that will be used by the new window.
     * Then all methods will be run in the context of the new window which
     * should be a new thread/process.
     * 
     */
    createSimulationWindow() {


        //Window title parameters that will be sent by a shared object
        const myId = this._simulationId;


        const myURL = 'simulations.html';
        _sharedObject.simulationId = myId;

        //Opening the window. Title will be set once window is opened
        window.open(myURL, "_blank");

        //Increment counter to have it ready for next simulations
        this._simulationId = this_simulationId + 1;

    }





}





var simulation = new SimulationController();





    // /**
    //  * This method reads the interface and creates a JSON object with the values.
    //  * 
    //  * @returns JSON
    //  */
    // readInterface() {

    //     //Common to control simulations and attack simulations
    //     const numberOfCells = parseInt(document.getElementById("numberOfCells").value);
    //     const numberOfFrames = parseInt(document.getElementById("numberOfFrames").value);
    //     const initialFramesToDiscard = parseInt(document.getElementById("framesDiscard").value);

    //     const densityInit = parseFloat(document.getElementById("densityInit").value);
    //     const densityEnd = parseFloat(document.getElementById("densityEnd").value);
    //     const densitySteps = parseInt(document.getElementById("densitySteps").value);

    //     const plotMaximumYValue = parseFloat(document.getElementById("plotMaximumYValue").value);
    //     const plotMinimumYValue = parseFloat(document.getElementById("plotMinimumYValue").value);

    //     const movableMaxSpeed = parseFloat(document.getElementById("movableMaxSpeed").value);
    //     const movablePerformanceHighLimit = parseFloat(document.getElementById("movablePerformanceHighLimit").value);
    //     const movablePerformanceLowLimit = parseFloat(document.getElementById("movablePerformanceLowLimit").value);

    //     //Control simulations only
    //     const controlNumberOfSimulations = parseFloat(document.getElementById("controlNumberOfSimulations").value);
    //     const controlNumberOfHackedMovables = parseFloat(document.getElementById("controlMovablesHacked").value);

    //     const controlProbabilityRanDomBrakeUniform = document.getElementById("controlProbabilityRandomBrakeUniform").checked;
    //     const controlProbabilityRanDomBrakeMultiple = document.getElementById("controlProbabilityRandomBrakeMultiple").checked;
    //     const controlProbabilityRandomBrake = parseFloat(document.getElementById("controlProbabilityRandomBrake").value);


    //     //Attack simulations only
    //     const attackNumberOfSimulations = parseFloat(document.getElementById("attackNumberOfSimulations").value);
    //     const attackNumberOfHackedMovables = parseFloat(document.getElementById("attackMovablesHacked").value);


    //     const attackProbabilityRandomBrakeUniform = document.getElementById("attackProbabilityRandomBrakeUniform").checked;
    //     const attackProbabilityRandomBrakeMultiple = document.getElementById("attackProbabilityRandomBrakeMultiple").checked;
    //     const attackProbabilityRandomBrake = parseFloat(document.getElementById("attackProbabilityRandomBrake").value);



    //     const controlProbabilityRandomBrakeArray = [];
    //     const attackProbabilityRandomBrakeArray = [];

    //     //Read Control Multiple probability Random Brake
    //     if (controlProbabilityRanDomBrakeMultiple === true) {

    //         for (let i = 0; i < numberOfCells; i++) {
    //             let myInputValue = parseFloat(document.getElementById("controlProbabilityCell" + i).value);
    //             controlProbabilityRandomBrakeArray.push(myInputValue);
    //         }
    //     }



    //     //Read Attack Multiple probability Random Brake
    //     if (attackProbabilityRandomBrakeMultiple === true) {

    //         for (let i = 0; i < numberOfCells; i++) {
    //             let myInputValue = parseFloat(document.getElementById("attackProbabilityCell" + i).value);
    //             attackProbabilityRandomBrakeArray.push(myInputValue);
    //         }
    //     }





    //     //Creating a new databank with the common parameters to control and attack simulations
    //     this.databank = new WorkbenchDataBank(
    //         numberOfCells,
    //         numberOfFrames,
    //         initialFramesToDiscard,
    //         densityInit,
    //         densityEnd,
    //         densitySteps,
    //         plotMaximumYValue,
    //         plotMinimumYValue,
    //         movableMaxSpeed,
    //         movablePerformanceHighLimit,
    //         movablePerformanceLowLimit,
    //         controlNumberOfSimulations,
    //         controlNumberOfHackedMovables,
    //         controlProbabilityRandomBrake,
    //         controlProbabilityRanDomBrakeMultiple,
    //         controlProbabilityRandomBrakeArray,
    //         attackNumberOfSimulations,
    //         attackNumberOfHackedMovables,
    //         attackProbabilityRandomBrake,
    //         attackProbabilityRandomBrakeMultiple,
    //         attackProbabilityRandomBrakeArray);


    // }