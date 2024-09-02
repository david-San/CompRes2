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
 * 2023 Apr 24: Refactoring
 * Split into multiple objects
 */

/**
 * This object is used to share variables between pages
 * If exists, it is not going to override it;
 */

var _sharedObject = _sharedObject !== null ? { "parameters": new Map() } : _sharedObject;





/**
 * This class starts the object creation and the simulation
 */
class CompRes {


    /**
     * 
     */
    constructor() {


        // ========================================================================== //
        // Privileged attributes


        //Internal structures
        this.visualiser;

        //TODO Delete this workbenchDatabank. It should be replaced by databank
        //Databank
        this.workbenchDataBank;

        //Databank        
        this.dataBank;



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


        this._simulationId = 1;;

        this._gui = new GUI();

        //Interface structures
        let _samples = [];


        //TODO Delete this. It should not be here
        let _plotDownloadOptions = [];

        this._that = this;

        this.samples = _samples;




        // ========================================================================== //
        // Private methods





        /**
         * This private method creates the sample menus
         */
        var createSampleMenu = function () {





            /**
             * This method pushes sample elements into the samples queue
             * @param {type} element
             * @returns {undefined}
             */
            var sampleMenuPush = function (element) {

                _samples.push(element);

                //It pushes the element to the menu
                sampleMenuCreate(element);
            };





            /**
             * This  method creates one sample menu
             * 
             * @param {type} sample
             * @returns {undefined}
             */
            var sampleMenuCreate = function (sample) {

                //It attaches an event handler for the "select sample" menu
                let paragraphElement = document.getElementById('samples_dropdown');

                //creating the menu item
                let myMenuItem = document.createElement("option");
                myMenuItem.setAttribute("value", sample.id);
                myMenuItem.text = "Sample " + sample.id;

                /*Append the menu item*/
                paragraphElement.appendChild(myMenuItem);
            };





            /**
             * This method handles events received from the select menu when loading a sample policy
             * 
             * @returns {undefined}
             */
            var sampleMenuHandleSelect = function () {

                //Selected index
                let selIndex = this.selectedIndex;

                if (selIndex !== 0) {


                    //It adjustes the index to use on an array
                    selIndex = (selIndex > 0) ? selIndex - 1 : selIndex;

                    //Finds the textSample corresponding to the selected value
                    let sample = _samples[selIndex];

                    // let x = window.confirm("Are you sure you want to load Sample " + sample.id + "?");
                    let x = true;

                    if (x) {

                        //Updates the interface with the samples
                        sampleMenuSetValues(sample);

                    } else {

                        //It resets the menu to show the 'Samples...' label
                        this[0].selected = "selected";

                    }
                }
            };





            /**
             * This method sets the interface with a JSON object.
             * 
             * @param {JSON} parameters 
             */
            var sampleMenuSetValues = function (parameters) {

                //Writing parameters to the interface

                //Commmon
                document.getElementById("numberOfCells").value = parameters.numberOfCells;
                document.getElementById("numberOfFrames").value = parameters.numberOfFrames;
                document.getElementById("framesDiscard").value = parameters.initialFramesToDiscard;


                document.getElementById("densityInit").value = parameters.densityInit;
                document.getElementById("densityEnd").value = parameters.densityEnd;
                document.getElementById("densitySteps").value = parameters.densitySteps;

                document.getElementById("plotMaximumYValue").value = parameters.plotMaximumYValue;
                document.getElementById("plotMinimumYValue").value = parameters.plotMinimumYValue;

                document.getElementById("movableMaxSpeed").value = parameters.movableMaxSpeed;
                document.getElementById("movablePerformanceHighLimit").value = parameters.movablePerformanceHighLimit;
                document.getElementById("movablePerformanceLowLimit").value = parameters.movablePerformanceLowLimit;

                //Control
                document.getElementById("controlProbabilityRandomBrake").value = parameters.controlProbabilityRandomBrake;
                document.getElementById("controlNumberOfSimulations").value = parameters.controlNumberOfSimulations;
                document.getElementById("controlMovablesHacked").value = parameters.controlMovablesHacked;

                //Attack
                document.getElementById("attackProbabilityRandomBrake").value = parameters.attackProbabilityRandomBrake;
                document.getElementById("attackNumberOfSimulations").value = parameters.attackNumberOfSimulations;
                document.getElementById("attackMovablesHacked").value = parameters.attackMovablesHacked;

            }






            //It attaches an event handler for the "select sample" menu
            if (document.getElementById('samples_dropdown') != null)
                document.getElementById('samples_dropdown').addEventListener('change', sampleMenuHandleSelect, false);

            let mySample1 = {
                "id": 1,
                "numberOfCells": 50,
                "numberOfFrames": 60,
                "initialFramesToDiscard": 10,
                "densityInit": 0.01,
                "densityEnd": 0.5,
                "densitySteps": 3,
                "plotMaximumYValue": 100,
                "plotMinimumYValue": -.5,

                "movableMaxSpeed": 5,
                "movablePerformanceHighLimit": 5,
                "movablePerformanceLowLimit": 0.5,

                "controlNumberOfSimulations": 10,
                "controlProbabilityRandomBrake": 0.1,
                "controlMovablesHacked": 0,

                "attackNumberOfSimulations": 10,
                "attackProbabilityRandomBrake": 0.1,
                "attackMovablesHacked": 1
            }

            sampleMenuPush(mySample1);

            let mySample2 = {
                "id": 2,
                "numberOfCells": 50,
                "numberOfFrames": 60,
                "initialFramesToDiscard": 10,
                "densityInit": 0.01,
                "densityEnd": 0.5,
                "densitySteps": 20,
                "plotMaximumYValue": 120,
                "plotMinimumYValue": -.5,

                "movableMaxSpeed": 5,
                "movablePerformanceHighLimit": 5,
                "movablePerformanceLowLimit": 0.5,

                "controlNumberOfSimulations": 100,
                "controlProbabilityRandomBrake": 0.1,
                "controlMovablesHacked": 0,

                "attackNumberOfSimulations": 100,
                "attackProbabilityRandomBrake": 0.5,
                "attackMovablesHacked": 0
            }

            sampleMenuPush(mySample2);

            let mySample3 = {
                "id": 3,
                "numberOfCells": 50,
                "numberOfFrames": 60,
                "initialFramesToDiscard": 10,
                "densityInit": 0.01,
                "densityEnd": 0.5,
                "densitySteps": 20,
                "plotMaximumYValue": 120,
                "plotMinimumYValue": -.5,

                "movableMaxSpeed": 5,
                "movablePerformanceHighLimit": 5,
                "movablePerformanceLowLimit": 0.1,

                "controlNumberOfSimulations": 100,
                "controlProbabilityRandomBrake": 0.1,
                "controlMovablesHacked": 0,

                "attackNumberOfSimulations": 100,
                "attackProbabilityRandomBrake": 0.1,
                "attackMovablesHacked": 1
            }

            sampleMenuPush(mySample3);

        }







        /**
         * This method inits the Workbench ataching interface elements to methods
         */
        var init = function () {

            //Creates menus
            createSampleMenu();

        };





        // ========================================================================== //
        // Privileged methods







        //Init the workbench
        init();
    }





    // ========================================================================== //
    // Public methods (Prototype methods)





    /**
     * This method reads the interface and creates a JSON object with the values.
     * The JSON object is a databank, descibed in the databank class.
     * 
     */
    readInterface() {

        //Common to all simulations
        const numberOfCells = parseInt(document.getElementById("numberOfCells").value);
        const numberOfFrames = parseInt(document.getElementById("numberOfFrames").value);
        const initialFramesToDiscard = parseInt(document.getElementById("framesDiscard").value);

        const densityInit = parseFloat(document.getElementById("densityInit").value);
        const densityEnd = parseFloat(document.getElementById("densityEnd").value);
        const densitySteps = parseInt(document.getElementById("densitySteps").value);

        const plotMaximumYValue = parseFloat(document.getElementById("plotMaximumYValue").value);
        const plotMinimumYValue = parseFloat(document.getElementById("plotMinimumYValue").value);

        const movableMaxSpeed = parseFloat(document.getElementById("movableMaxSpeed").value);
        const movablePerformanceHighLimit = parseFloat(document.getElementById("movablePerformanceHighLimit").value);
        const movablePerformanceLowLimit = parseFloat(document.getElementById("movablePerformanceLowLimit").value);

        const numberOfScenarios = parseFloat(document.getElementById("numberOfScenarios").value);

        const simulationId = this._simulationId;

        //Creating a new databank with the common parameters to control and attack simulations
        this.databank = new Databank(
            simulationId,
            numberOfCells,
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
            numberOfScenarios);




        for (let i = 0; i < numberOfScenarios; i++) {

            let numberOfSimulations = parseFloat(document.getElementById("numberOfSimulations.Scenario" + i).value);
            let numberOfHackedMovables = parseFloat(document.getElementById("numberOfHackedMovables.Scenario" + i).value);
            let probabilityRandomBrakeUniform = document.getElementById("probabilityRandomBrakeUniform.Scenario" + i).value;
            let radioProbabilityRandomBrakeMultiple = document.getElementById("radioProbabilityRandomBrakeMultiple.Scenario" + i).checked;

            //Array structure with probabilities of random Brakes
            let probabilityRandomBrakeArray = [];
            const fieldNamePrefix = "probabilityCell.Scenario" + i;

            if (radioProbabilityRandomBrakeMultiple === true) {
                for (let j = 0; j < numberOfCells; j++) {
                    let myInputValue = parseFloat(document.getElementById(fieldNamePrefix + ".cell" + j).value);
                    probabilityRandomBrakeArray.push(myInputValue);
                }
            }



            this.databank.addScenario(
                numberOfSimulations,
                numberOfHackedMovables,
                probabilityRandomBrakeUniform,
                radioProbabilityRandomBrakeMultiple,
                probabilityRandomBrakeArray);

        }



        //Increment counter to have it ready for next simulations
        this._simulationId = this._simulationId + 1;
    }




    /**
     *  This method writes back to the interface using a JSON object with the values.
     * 
     */
    //TODO Review this method.
    writeInterface() {

        //Common to control simulations and attack simulations
        document.getElementById("numberOfCells").value = this.workbenchDataBank.common.numberOfCells;
        document.getElementById("numberOfFrames").value = this.workbenchDataBank.common.numberOfFrames;

        document.getElementById("framesDiscard").value = this.workbenchDataBank.common.initialFramesToDiscard;
        document.getElementById("densityInit").value = this.workbenchDataBank.common.densityInit;
        document.getElementById("densityEnd").value = this.workbenchDataBank.common.densityEnd;
        document.getElementById("densitySteps").value = this.workbenchDataBank.common.densitySteps;

        document.getElementById("plotMaximumYValue").value = this.workbenchDataBank.common.plotMaximumYValue;
        document.getElementById("plotMinimumYValue").value = this.workbenchDataBank.common.plotMinimumYValue;

        document.getElementById("movableMaxSpeed").value = this.workbenchDataBank.common.movableMaxSpeed;
        document.getElementById("movablePerformanceHighLimit").value = this.workbenchDataBank.common.movablePerformanceHighLimit;
        document.getElementById("movablePerformanceLowLimit").value = this.workbenchDataBank.common.movablePerformanceLowLimit;

        //Control simulations only
        document.getElementById("controlNumberOfSimulations").value = this.workbenchDataBank.control.numberOfSimulations;
        document.getElementById("controlMovablesHacked").value = this.workbenchDataBank.control.numberOfHackedMovables;
        document.getElementById("controlProbabilityRandomBrake").value = this.workbenchDataBank.control.probabilityRandomBrake;
        document.getElementById("controlProbabilityRandomBrakeMultiple").checked = this.workbenchDataBank.control.probabilityRandomBrakeMultiple;

        //Writing multiple probability random Brake control fields
        if (this.workbenchDataBank.control.probabilityRandomBrakeMultiple === true) {
            const container = document.getElementById("controlProbabilityMultipleValue");
            const numberOfCells = this.workbenchDataBank.common.numberOfCells;
            const uniformValue = this.workbenchDataBank.control.probabilityRandomBrake;
            const fieldNamePrefix = "controlProbabilityCell"
            const probabilityRandomBrakeArray = this.workbenchDataBank.control.probabilityRandomBrakeArray;

            this.createMultipleProbabilityRandomBrakeInputFields(
                container,
                numberOfCells,
                uniformValue,
                fieldNamePrefix,
                probabilityRandomBrakeArray);
        }





        //Attack simulations only
        document.getElementById("attackNumberOfSimulations").value = this.workbenchDataBank.attack.numberOfSimulations;
        document.getElementById("attackMovablesHacked").value = this.workbenchDataBank.attack.numberOfHackedMovables;
        document.getElementById("attackProbabilityRandomBrake").value = this.workbenchDataBank.attack.probabilityRandomBrake;

        document.getElementById("attackProbabilityRandomBrakeMultiple").checked = this.workbenchDataBank.attack.probabilityRandomBrakeMultiple;

        //Writing multiple probability random Brake attack fields
        if (this.workbenchDataBank.attack.probabilityRandomBrakeMultiple === true) {
            const container = document.getElementById("attackProbabilityMultipleValue");
            const numberOfCells = this.workbenchDataBank.common.numberOfCells;
            const uniformValue = this.workbenchDataBank.attack.probabilityRandomBrake;
            const fieldNamePrefix = "attackProbabilityCell";
            const probabilityRandomBrakeArray = this.workbenchDataBank.attack.probabilityRandomBrakeArray;

            this.createMultipleProbabilityRandomBrakeInputFields(
                container,
                numberOfCells,
                uniformValue,
                fieldNamePrefix,
                probabilityRandomBrakeArray);
        }



    }










    /**
     * 
     * This prototype method starts everything 
     * To do so, it initialises most of the parameters required to start a simulation
     * 
     */
    run() {

        this.readInterface();
        this.createSimulationWindow()

    }





    /**
     * 
     * This prototype method loads previously saved datasets.
     * 
     */
    load() {

        let myWorkBenchDataBank;

        async function loadFile(file, that) {
            let text = await file.text();

            myWorkBenchDataBank = new WorkbenchDataBank(text);

            that.workbenchDataBank = myWorkBenchDataBank;

            that.writeInterface();

            //!Disabled
            // that.drawResults();

        }

        const input = document.createElement('input');
        input.type = 'file';

        input.onchange = _this => {
            loadFile(input.files[0], this);

        };

        input.click();

    }





 









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
     * This method creates the scenarios.
     * It reads from the interface how many it needs to creates.
     * 
     * Then it calls a common GUI method to draw collapsible
     */
    createScenarios() {

        const container = document.getElementById('scenarios');

        //Delete previous entries
        container.innerHTML = "";

        //Common to control simulations and attack simulations
        const numberOfScenarios = parseInt(document.getElementById("numberOfScenarios").value);

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
                compRes.createMultipleProbabilityRandomBrakeInputFields(container, numberOfCells, uniformValue, fieldNamePrefix);


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

        // //Window title parameters that will be sent by a shared object
        // const myId = this._simulationId;

        // //Opening the window. Title will be set once window is opened
        // const myURL = 'simulation.html';
        // _sharedObject.simulationId = myId;
        // _sharedObject.databank = this.databank;

        // const mySimulation = window.open(myURL, "_blank");
        // mySimulation._shareObject = _sharedObject;

        // //Increment counter to have it ready for next simulations
        // this._simulationId = this._simulationId + 1;





        //Window title parameters that will be sent by a copy.
        //I am using it as an identifier to save parameters
        const myUUID = crypto.randomUUID();

        _sharedObject.parameters.set(myUUID, this.databank);

        //Opening the window. Title will be set once window is opened
        const myURL = 'simulation.html';

        const mySimulation = window.open(myURL, "_blank");

        mySimulation.name = myUUID;
        mySimulation._shareObject = _sharedObject;
        
    }





}





var compRes = new CompRes();












    // /**
    //  * This method calculates the resilience index for the flow.
    //  * It takes into consideration the common resilience region.
    //  */
    // calculateResilienceIndex() {


    //     //Storing the results of the simulation into the databank
    //     const simulationControl = this.workbenchDataBank.control.simulations;
    //     const simulationAttack = this.workbenchDataBank.attack.simulations;

    //     const myControlRegionTraces = this.calculateResilienceRegion(simulationControl, "Max", "Min");
    //     const myAttackRegionTraces = this.calculateResilienceRegion(simulationAttack, "Max attack", "Min attack");


    //     this.workbenchDataBank.control.controlRegionTraces = myControlRegionTraces;
    //     this.workbenchDataBank.attack.attackRegionTraces = myAttackRegionTraces;



    //     //Placing Max into a Map for easy finding values
    //     const myControlRegionMaxMap = new Map();
    //     const topMax = myControlRegionTraces.get(0).x.length;
    //     for (let i = 0; i < topMax; i++) {
    //         myControlRegionMaxMap.set(
    //             myControlRegionTraces.get(0).x[i],
    //             myControlRegionTraces.get(0).y[i],
    //         )
    //     }

    //     //Placing Min into a Map for easy finding values
    //     const myControlRegionMinMap = new Map();
    //     const topMin = myControlRegionTraces.get(1).x.length;
    //     for (let i = 0; i < topMin; i++) {
    //         myControlRegionMinMap.set(
    //             myControlRegionTraces.get(1).x[i],
    //             myControlRegionTraces.get(1).y[i],
    //         )
    //     }





    //     //Control
    //     const topControl = simulationControl.size;

    //     for (let i = 0; i < topControl; i++) {

    //         let mySimulation = simulationControl.get(i);

    //         //Iterating the map
    //         for (const [density, simulatorResult] of mySimulation) {

    //             simulatorResult.resilienceFlowBoundaryRegionMax = myControlRegionMaxMap.get(density);
    //             simulatorResult.resilienceFlowBoundaryRegionMin = myControlRegionMinMap.get(density);

    //             simulatorResult.resilienceFlowIndexMax = simulatorResult.totalMovablesCrossedFinishLine /
    //                 simulatorResult.resilienceFlowBoundaryRegionMax;

    //             simulatorResult.resilienceFlowIndexMin = simulatorResult.totalMovablesCrossedFinishLine /
    //                 simulatorResult.resilienceFlowBoundaryRegionMin;
    //         }
    //     }





    //     //Attack
    //     const topAttack = simulationAttack.size;

    //     for (let i = 0; i < topAttack; i++) {

    //         let mySimulation = simulationAttack.get(i);

    //         //Iterating the map
    //         for (const [density, simulatorResult] of mySimulation) {

    //             simulatorResult.resilienceFlowBoundaryRegionMax = myControlRegionMaxMap.get(density);
    //             simulatorResult.resilienceFlowBoundaryRegionMin = myControlRegionMinMap.get(density);

    //             simulatorResult.resilienceFlowIndexMax = simulatorResult.totalMovablesCrossedFinishLine /
    //                 simulatorResult.resilienceFlowBoundaryRegionMax;

    //             simulatorResult.resilienceFlowIndexMin = simulatorResult.totalMovablesCrossedFinishLine /
    //                 simulatorResult.resilienceFlowBoundaryRegionMin;
    //         }
    //     }
    // }





    // /**
    //  * This method calculates the resilience reigion numerically.
    //  */
    // calculateResilienceRegion(simulations, maxTag, minTag) {

    //     const topSimulations = simulations.size;
    //     const traces = new Map();

    //     //Create a new object trace to store results to be collected

    //     const myTraceMax = {
    //         x: new Array(),
    //         y: new Array(),
    //         name: maxTag,
    //     };

    //     const myTraceMin = {
    //         x: new Array(),
    //         y: new Array(),
    //         name: minTag,
    //     };

    //     for (let i = 0; i < topSimulations; i++) {

    //         //Getting each iteration of a simulation
    //         let simulation = simulations.get(i);
    //         let densities = Array.from(simulation.keys());

    //         let topDensities = densities.length;





    //         for (let j = 0; j < topDensities; j++) {

    //             //Traversing all densities in a simulation
    //             let totalMovablesCrossedFinishLine = simulation.get(densities[j]).totalMovablesCrossedFinishLine;

    //             if (typeof myTraceMax.y[j] === 'undefined') {

    //                 myTraceMax.x.push(densities[j]);
    //                 myTraceMax.y.push(totalMovablesCrossedFinishLine);

    //             } else if (totalMovablesCrossedFinishLine > myTraceMax.y[j]) {

    //                 myTraceMax.y[j] = totalMovablesCrossedFinishLine;
    //             }




    //             if (typeof myTraceMin.y[j] === 'undefined') {

    //                 myTraceMin.x.push(densities[j]);
    //                 myTraceMin.y.push(totalMovablesCrossedFinishLine);

    //             } else if (totalMovablesCrossedFinishLine < myTraceMin.y[j]) {

    //                 myTraceMin.y[j] = totalMovablesCrossedFinishLine;
    //             }


    //         }

    //         //Adding the new series to the traces using the iteration i as key
    //         traces.set(0, myTraceMax);
    //         traces.set(1, myTraceMin);

    //     }

    //     return traces;
    // }






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
    // //TODO Delete this. It should not be here
    // downloadDatasets() {



    //     const datasets = document.createElement('a');
    //     datasets.setAttribute("href", "../datasets/datasets.zip");
    //     datasets.setAttribute("download", "datasets.zip");
    //     datasets.setAttribute("target", "_blank");
    //     datasets.click();
    // }

    



       // /**
    //  * 
    //  * This prototype method saves current dataset.
    //  * 
    //  * It has to download text as a blob because it is too large to do it with 
    //  * a.href = 'data:application/csv;charset=utf-8,' + encodeURIComponent(myWorkbenchDataBank);
    //  * 
    //  * 
    //  * Based on this site:
    //  * 
    //  * https://www.bennadel.com/blog/3472-downloading-text-using-blobs-url-createobjecturl-and-the-anchor-download-attribute-in-javascript.htm
    //  * 
    //  * https://stackoverflow.com/questions/70732624/how-to-download-url-from-createobjecturl-and-save-it-in-a-folder
    //  */
    // //TODO Delete this. It should not be here
    // save() {

    //     if (typeof this.workbenchDataBank !== 'undefined') {

    //         //Actually, it is not needed to stringify the data first, because I am saving using Blob
    //         //Stringify uses a recursive method to handle maps.
    //         //This is very memory intensive and does not work for large objects.
    //         //Only activate this option for debugging small objects
    //         // const myWorkbenchDataBank = this.workbenchDataBank.toString();

    //         const myWorkbenchDataBank = this.workbenchDataBank;

    //         //It appends the element to a document model to save it, using the appropriate encoding set
    //         //I had to download it as a blob because the size is too large.
    //         const blob = new Blob(
    //             [myWorkbenchDataBank], //Blob parts
    //             { type: "text/plain;charset=utf-8" }
    //         );

    //         const downloadURL = URL.createObjectURL(blob);

    //         const output = document.createElement('a');
    //         output.href = downloadURL;
    //         output.target = '_blank';
    //         output.download = 'CompRes.txt';

    //         //It forces a download
    //         // document.body.appendChild(output);
    //         output.click();

    //         //This releases the resource for another download
    //         URL.revokeObjectURL(output.href);

    //     }
    // }