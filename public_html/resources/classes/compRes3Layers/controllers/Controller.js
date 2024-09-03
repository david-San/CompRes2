/** 
 * David Sanchez
 * Newcastle University
 * 
 * 2024 Jul 02: Created
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
 * 
 */

/**
 * This object is used to share variables between pages
 * If exists, it is not going to override it;
 */

var _sharedObject = _sharedObject !== null ? { "parameters": new Map() } : _sharedObject;





/**
 * This class starts the object creation and the simulation
 */
class CompRes3LayersController {


    /**
     * 
     */
    constructor() {


        // ========================================================================== //
        // Privileged attributes


        //Internal structures
        this.databank;
        this.visualiser;


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

        this._simulationId = 1;
        this._sampleId = 1;
        this._gui = new GUI();

        //Interface structures
        this._samples = [];

        this._that = this;




        //TODO Delete this
        //TODO Provisional. This has to be in databank
        // this._numberOfScenarios;






        // ========================================================================== //
        // Private methods





        // ========================================================================== //
        // Privileged methods





        //Init CompRes interface
        this.init();
    }





    // ========================================================================== //
    // Public methods (Prototype methods)






    /**
     * This method inits CompRes Interface
     */
    init() {


        this.sampleMenuCreate();
        this.createLayerCollapsible3();
        // this.createLayers();
        // this.createLayerCollapsible1();
        // this.createLayerCollapsible2();


    }





    /**
     * This method creates the samples Menu.
     * 
     * 
     * The binding technique was read from here:
     * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
     * 
     * I did not used this option, because I prefer arrow function:
     * this.sampleMenuHandleSelect = this.sampleMenuHandleSelect.bind(this);
     * 
     * Note: readTextFile is an operation that has a function that executes in an
     * asynchronous context. As a consequence, "this" is undefined in that
     * context. So code like this does not work:
     *  this.readTextFile(file, function (text) {
     *        this.sampleMenuPush(text);
     *   });
     * One way to solve the issue is to send "this" as a variable.
     * Another way is to use the => definition for function that will
     * differ evaluation in the future. 
     * I used => in this case because I do  not think this software
     * will be run in old browsers.
     * 
     */
    sampleMenuCreate() {

        //It attaches an event handler for the "select sample" menu
        if (document.getElementById('samples_dropdown') != null)
            document.getElementById('samples_dropdown').addEventListener('change', (e) => { this.sampleMenuHandleSelect(e) }, false);

        //Loads the sample menu using Text files 
        //I use arrow operator to differ the evaluation of "this" context
        this.readTextFile("../samples/Sample1.json", text => this.sampleMenuPush(text));
        this.readTextFile("../samples/Sample2.json", text => this.sampleMenuPush(text));
        this.readTextFile("../samples/Sample3.json", text => this.sampleMenuPush(text));
    }





    /**
     * This method handles events received from the select menu when loading a sample policy
     * 
     * @returns {undefined}
     */
    sampleMenuHandleSelect(e) {

        //Selected index    
        const selIndex = e.currentTarget.selectedIndex;

        if (selIndex !== 0 && selIndex != undefined) {


            //It adjustes the index to use on an array
            const selIndexArray = (selIndex > 0) ? selIndex - 1 : selIndex;

            //Finds the textSample corresponding to the selected value
            const sample = this._samples[selIndexArray];

            const x = window.confirm("Are you sure you want to load Sample " + selIndex + "?");
            // let x = true;

            if (x) {
                //Updates the interface with the samples
                this.databank = sample;
                this.createOrUpdateWindow();

            } else {

                //It resets the menu to show the 'Samples...' label
                e.currentTarget.selectedIndex = 0;
            }
        }
    };





    /**
      * This method pushes sample elements into the samples queue
      * @param {type} sample
      * @returns {undefined}
      */
    sampleMenuPush(text) {

        //Use the data structure to parse the text and handle Maps correctly
        const sample = new Databank(text);

        //It pushes the element to the menu
        this._samples.push(sample);

        //It attaches an event handler for the "select sample" menu
        let paragraphElement = document.getElementById('samples_dropdown');

        //creating the menu item
        let myMenuItem = document.createElement("option");
        myMenuItem.setAttribute("value", this._sampleId);
        myMenuItem.text = "Sample " + this._sampleId;

        //Increase counter for next call of the method
        this._sampleId = this._sampleId + 1;

        /*Append the menu item*/
        paragraphElement.appendChild(myMenuItem);
    };





    /**
     * This method reads a text file, in this case a .JSON, directly from the server
     * It is an asynchronous operation.
     * 
     * It was taken from:
     * 
     * https://stackoverflow.com/questions/19706046/how-to-read-an-external-local-json-file-in-javascript
     * 
     * @param {*} file 
     * @param {*} callback 
     */
    readTextFile(file, callback) {
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4 && rawFile.status == "200") {
                callback(rawFile.responseText);
            }
        }
        rawFile.send(null);
    }





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

        // const plotMaximumYValue = parseFloat(document.getElementById("plotMaximumYValue").value);
        // const plotMinimumYValue = parseFloat(document.getElementById("plotMinimumYValue").value);

        const movableMaxSpeed = parseFloat(document.getElementById("movableMaxSpeed").value);
        const movablePerformanceHighLimit = parseFloat(document.getElementById("movablePerformanceHighLimit").value);
        const movablePerformanceLowLimit = parseFloat(document.getElementById("movablePerformanceLowLimit").value);

        const numberOfScenarios = parseFloat(document.getElementById("numberOfScenarios").value);

        const simulationId = this._simulationId.toString();


        //TODO Delete this
        // const simulationId = this._simulationId;

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

            let numberOfRepetitions = parseFloat(document.getElementById("numberOfRepetitions.Scenario" + i).value);
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
                numberOfRepetitions,
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
    writeInterface() {

        //Common to control simulations and attack simulations
        const numberOfCells = this.databank.common.numberOfCells;
        document.getElementById("numberOfCells").value = numberOfCells;
        document.getElementById("numberOfFrames").value = this.databank.common.numberOfFrames;

        document.getElementById("framesDiscard").value = this.databank.common.initialFramesToDiscard;
        document.getElementById("densityInit").value = this.databank.common.densityInit;
        document.getElementById("densityEnd").value = this.databank.common.densityEnd;
        document.getElementById("densitySteps").value = this.databank.common.densitySteps;

        // document.getElementById("plotMaximumYValue").value = this.databank.common.plotMaximumYValue;
        // document.getElementById("plotMinimumYValue").value = this.databank.common.plotMinimumYValue;

        document.getElementById("movableMaxSpeed").value = this.databank.common.movableMaxSpeed;
        document.getElementById("movablePerformanceHighLimit").value = this.databank.common.movablePerformanceHighLimit;
        document.getElementById("movablePerformanceLowLimit").value = this.databank.common.movablePerformanceLowLimit;

        const numberOfScenarios = this.databank.common.numberOfScenarios;
        document.getElementById("numberOfScenarios").value = numberOfScenarios;

        //Create the collapsibles
        this.createScenarios();

        //Write collapsibles
        for (let i = 0; i < numberOfScenarios; i++) {

            let myScenario = this.databank.scenarios.get(i.toString());

            document.getElementById("numberOfRepetitions.Scenario" + i).value = myScenario.numberOfRepetitions;
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

        let myDatabank;

        async function loadFile(file, that) {
            let text = await file.text();

            myDatabank = new Databank(text);

            that.databank = myDatabank;

            that.createOrUpdateWindow();
        }

        const input = document.createElement('input');
        input.type = 'file';

        input.onchange = _this => {
            loadFile(input.files[0], this);

        };

        input.click();

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

        this.readInterface();

        if (typeof this.databank !== 'undefined') {

            //Actually, it is not needed to stringify the data first, because I am saving using Blob
            //Stringify uses a recursive method to handle maps.
            //This is very memory intensive and does not work for large objects.
            //Only activate this option for debugging small objects
            //const myDataBank = this.databank.toString();

            const myDataBank = this.databank;

            //It appends the element to a document model to save it, using the appropriate encoding set
            //I had to download it as a blob because the size is too large.
            const blob = new Blob(
                [myDataBank], //Blob parts
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

            this._gui.collapsiblesCreateOne(container, contentID, panelName, panelLabel, panelLegend);

            let contentPanel = document.getElementById(panelName);

            this.createScenarioCollapsible(contentPanel, i);
            // this.assignRadioBehaviour(i);

        }

        this._gui.collapsiblesAssignBehaviour();
    }




    /**
     * This method create one scenario collapsible
     */
    createScenarioCollapsible(container, id) {

        //Number of simulations
        const mySpannumberOfRepetitions = document.createElement("span");
        mySpannumberOfRepetitions.setAttribute("class", "label2");
        mySpannumberOfRepetitions.innerHTML = "Number of Repetitions [Recommended 100]";

        const myInputFieldnumberOfRepetitions = document.createElement("input");
        myInputFieldnumberOfRepetitions.setAttribute("class", "input");
        myInputFieldnumberOfRepetitions.setAttribute("type", "text");
        myInputFieldnumberOfRepetitions.setAttribute("id", "numberOfRepetitions.Scenario" + id);

        container.append(mySpannumberOfRepetitions);
        container.append(myInputFieldnumberOfRepetitions);
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
     * This method creates the scenarios.
     * It reads from the interface how many it needs to creates.
     * 
     * Then it calls a common GUI method to draw collapsible
     */
    // createScenariosLayer3() {

    //     const container = document.getElementById('scenarios');

    //     //Delete previous entries
    //     container.innerHTML = "";

    //     //Common to control simulations and attack simulations
    //     const numberOfScenarios = parseInt(document.getElementById("numberOfScenarios").value);

    //     this._numberOfScenarios = numberOfScenarios;

    //     for (let i = 0; i < numberOfScenarios; i++) {

    //         let contentID = "scenario" + i;
    //         let panelName = "panelScenario" + i;
    //         let panelLabel = "Scenario " + i;
    //         let panelLegend = "Scenario " + i;

    //         this._gui.collapsiblesCreateOne(container, contentID, panelName, panelLabel, panelLegend);

    //         let contentPanel = document.getElementById(panelName);

    //         this.createScenarioCollapsibleLayer3(contentPanel, i);
    //         // this.assignRadioBehaviour(i);






    //     }

    //     this._gui.collapsiblesAssignBehaviour();
    // }



















    /**
     * This method create one scenario collapsible
     */
    createScenarioCollapsibleLayer3(container, id) {


    
        // const container = document.getElementById('scenarios');


        //TODO Provisioanl. Assign to databank
        // const numberOfScenarios = this.databank.common.numberOfScenarios;
        const numberOfScenarios = this._numberOfScenarios;




        //Delete previous entries
        container.innerHTML = "";


        const i = 3;

        let contentID = "Scenario"+id+"Layer" + i;
        let panelName = "Scenario"+id+"panelLayer" + i;
        let panelLabel = "Layer " + i;
        let panelLegend = "Layer " + i;

        this._gui.collapsiblesCreateOne(container, contentID, panelName, panelLabel, panelLegend);


        this.createLayerCollapsible3(contentID,panelName)

        this._gui.collapsiblesAssignBehaviour();









        // //Update size of the collapsible
        // const content = document.getElementById(panelName);
        // content.style.maxHeight = content.scrollHeight + "px";














        // //Number of simulations
        // const mySpannumberOfRepetitions = document.createElement("span");
        // mySpannumberOfRepetitions.setAttribute("class", "label2");
        // mySpannumberOfRepetitions.innerHTML = "Number of Repetitions [Recommended 100]";

        // const myInputFieldnumberOfRepetitions = document.createElement("input");
        // myInputFieldnumberOfRepetitions.setAttribute("class", "input");
        // myInputFieldnumberOfRepetitions.setAttribute("type", "text");
        // myInputFieldnumberOfRepetitions.setAttribute("id", "numberOfRepetitions.Scenario" + id);

        // container.append(mySpannumberOfRepetitions);
        // container.append(myInputFieldnumberOfRepetitions);
        // container.append(document.createElement("br"));





        // //Number of hacked movables
        // const mySpanNumberOfHackedMovables = document.createElement("span");
        // mySpanNumberOfHackedMovables.setAttribute("class", "label2");
        // mySpanNumberOfHackedMovables.innerHTML = "Number of Hacked Movables [Recommended 0,1,...]";

        // const myInputFieldNumberOfHackedMovables = document.createElement("input");
        // myInputFieldNumberOfHackedMovables.setAttribute("class", "input");
        // myInputFieldNumberOfHackedMovables.setAttribute("type", "text");
        // myInputFieldNumberOfHackedMovables.setAttribute("id", "numberOfHackedMovables.Scenario" + id);

        // container.append(mySpanNumberOfHackedMovables);
        // container.append(myInputFieldNumberOfHackedMovables);
        // container.append(document.createElement("br"));





        // //Probability Random Brake section
        // const mySpanProbabilityRandomBrake = document.createElement("span");
        // mySpanProbabilityRandomBrake.setAttribute("class", "label2");
        // mySpanProbabilityRandomBrake.innerHTML = "Probability Random Brake [Recommended 0.1+]";

        // const myInputRadioProbabilityRandomBrakeUniform = document.createElement("input");
        // myInputRadioProbabilityRandomBrakeUniform.setAttribute("class", "inputRadio");
        // myInputRadioProbabilityRandomBrakeUniform.setAttribute("type", "radio");
        // myInputRadioProbabilityRandomBrakeUniform.setAttribute("id", "radioProbabilityRandomBrakeUniform.Scenario" + id);
        // myInputRadioProbabilityRandomBrakeUniform.setAttribute("name", "probabilityRandomBrake.Scenario" + id);
        // myInputRadioProbabilityRandomBrakeUniform.setAttribute("checked", true);

        // const myLabelProbabilityRandomBrakeUniform = document.createElement("label");
        // myLabelProbabilityRandomBrakeUniform.setAttribute("class", "labelRadio");
        // myLabelProbabilityRandomBrakeUniform.setAttribute("for", "labelProbabilityRandomBrakeUniform.Scenario" + id);
        // myLabelProbabilityRandomBrakeUniform.innerHTML = "Uniform";

        // const myInputFieldProbabilityRandomBrakeUniform = document.createElement("input");
        // myInputFieldProbabilityRandomBrakeUniform.setAttribute("class", "input");
        // myInputFieldProbabilityRandomBrakeUniform.setAttribute("type", "text");
        // myInputFieldProbabilityRandomBrakeUniform.setAttribute("id", "probabilityRandomBrakeUniform.Scenario" + id);

        // const mySpanProbabilityRandomBrakeMultiple = document.createElement("span");
        // mySpanProbabilityRandomBrakeMultiple.setAttribute("class", "label2");

        // const myInputRadioProbabilityRandomBrakeMultiple = document.createElement("input");
        // myInputRadioProbabilityRandomBrakeMultiple.setAttribute("class", "inputRadio");
        // myInputRadioProbabilityRandomBrakeMultiple.setAttribute("type", "radio");
        // myInputRadioProbabilityRandomBrakeMultiple.setAttribute("id", "radioProbabilityRandomBrakeMultiple.Scenario" + id);
        // myInputRadioProbabilityRandomBrakeMultiple.setAttribute("name", "probabilityRandomBrake.Scenario" + id);

        // const myLabelProbabilityRandomBrakeMultiple = document.createElement("label");
        // myLabelProbabilityRandomBrakeMultiple.setAttribute("class", "labelRadio");
        // myLabelProbabilityRandomBrakeMultiple.setAttribute("for", "probabilityRandomBrakeMultiple.Scenario" + id);
        // myLabelProbabilityRandomBrakeMultiple.innerHTML = "Multiple";

        // const mySpanScrollProbabilityRandomBrakeMultiple = document.createElement("span");
        // mySpanScrollProbabilityRandomBrakeMultiple.setAttribute("class", "label2");

        // const myScrollProbabilityRandomBrakeMultiple = document.createElement("div");
        // myScrollProbabilityRandomBrakeMultiple.setAttribute("class", "scroll");
        // myScrollProbabilityRandomBrakeMultiple.setAttribute("id", "probabilityRandomBrakeMultipleScroll.Scenario" + id);





        // container.append(mySpanProbabilityRandomBrake);
        // container.append(myInputRadioProbabilityRandomBrakeUniform);
        // container.append(myLabelProbabilityRandomBrakeUniform);
        // container.append(myInputFieldProbabilityRandomBrakeUniform);
        // container.append(document.createElement("br"));

        // container.append(mySpanProbabilityRandomBrakeMultiple);
        // container.append(myInputRadioProbabilityRandomBrakeMultiple);
        // container.append(myLabelProbabilityRandomBrakeMultiple);
        // container.append(document.createElement("br"));

        // container.append(mySpanScrollProbabilityRandomBrakeMultiple);
        // container.append(myScrollProbabilityRandomBrakeMultiple);
        // container.append(document.createElement("br"));

    }









    /**
     * This prototype method decides if the save file is only a sample
     * with only parameters that can be seen in the current window or
     * requires a new Simulation window with everything computed.
     * 
     * This code cannot be executed inside the load thread, so it is placed
     * in its own method.
     * 
     */
    createOrUpdateWindow() {
        //Checking the first value of scenarios for regionTraces
        //If regionTraces does not exist, this is a new simulation to compute
        const iterator = this.databank.scenarios.values();
        const firstScenarioValue = iterator.next().value;

        if (Object.hasOwn(firstScenarioValue, 'regionTraces')) {
            //This is an old simulation already computed.
            //Create a new window with precomputed data.
            this.createSimulationWindow();

        } else {
            //This is a new simulation.
            //Update current window with read data.
            this.writeInterface();
        }
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





    /**
     * This prototype method download the datasets.
     *
     * The datasets are basically text file in which there is a minified JSON object.
     * They are large in size because they are plain text.
     * I compressed them in zip and I am distributing them with the source code.
     *
     * They have to be downloaded first, then unzip and then uploaded again because:
     * - Compressed they are small but uncompressed are too large to be hosted in
     *   github cheapily
     * - I cannot uncompressed them on the fly in the webpage because thre are no
     *   .zip uncompressors that work in Javascript at this moment.
     *
     * Datasets are just a run of Sample 1, Sample 2 and Sample 3.
     * Due to the nature of the simulator, it is unlikely that you will get the same
     * simulation if you run those samples again. So, in order to produce the article
     * I needed to have a stable simulation to do the illustrations and analsyis.
     * 
     */
    downloadDatasets() {



        const datasets = document.createElement('a');
        datasets.setAttribute("href", "../datasets/datasets.zip");
        datasets.setAttribute("download", "datasets.zip");
        datasets.setAttribute("target", "_blank");
        datasets.click();
    }






    /**
     * This method creates the layers.
     * It calls a common GUI method to draw collapsible
     */
    createLayers() {


        const container = document.getElementById('layers');

        //Delete previous entries
        container.innerHTML = "";

        //Common to control simulations and attack simulations
        const numberOfLayers = 2;

        for (let i = 1; i <= numberOfLayers; i++) {

            let contentID = "layer" + i;
            let panelName = "panelLayer" + i;
            let panelLabel = "Layer " + i;
            let panelLegend = "Layer " + i;

            this._gui.collapsiblesCreateOne(container, contentID, panelName, panelLabel, panelLegend);

            // let contentPanel = document.getElementById(panelName);

            // this.createScenarioCollapsible(contentPanel, i);
            // this.assignRadioBehaviour(i);

        }

        this._gui.collapsiblesAssignBehaviour();
    }




    /**
     * This method creates the layer 1 Collapsible with its properties
     */
    createLayerCollapsible1() {

        //Leyend
        const myLayer = document.getElementById("legendlayer1");
        myLayer.innerHTML = "Physical layer";

        const container = document.getElementById("panelLayer1")





        //Link existence
        const myPanelLinkExistence = document.createElement("div");
        myPanelLinkExistence.setAttribute("id", "panelInputLeft");

        const myPanelLinkExistenceTitle = document.createElement("h5");
        myPanelLinkExistenceTitle.innerHTML = "Link existence";

        const mySpanNumberOfCells = document.createElement("span");
        mySpanNumberOfCells.setAttribute("class", "label2");
        mySpanNumberOfCells.innerHTML = "Number of Cells [10, 600, etc.]";

        const myInputFieldNumberOfCells = document.createElement("input");
        myInputFieldNumberOfCells.setAttribute("class", "input");
        myInputFieldNumberOfCells.setAttribute("type", "text");
        myInputFieldNumberOfCells.setAttribute("id", "numberOfCells");

        myPanelLinkExistence.append(myPanelLinkExistenceTitle);
        myPanelLinkExistence.append(mySpanNumberOfCells);
        myPanelLinkExistence.append(myInputFieldNumberOfCells);





        //Arming
        container.append(myPanelLinkExistence);





        //Movable Objects existence
        const myPanelMovableObjectsExistence = document.createElement("div");
        myPanelMovableObjectsExistence.setAttribute("id", "panelInputLeft");

        const myPanelMovableObjectsExistenceTitle = document.createElement("h5");
        myPanelMovableObjectsExistenceTitle.innerHTML = "Movable Objects existence";





        //Density Init
        const mySpanDensityInit = document.createElement("span");
        mySpanDensityInit.setAttribute("class", "label2");
        mySpanDensityInit.innerHTML = "Density Init [0.0 - 1.0]";

        const myInputFieldDensityInit = document.createElement("input");
        myInputFieldDensityInit.setAttribute("class", "input");
        myInputFieldDensityInit.setAttribute("type", "text");
        myInputFieldDensityInit.setAttribute("id", "densityInit");

        myPanelMovableObjectsExistence.append(myPanelMovableObjectsExistenceTitle);
        myPanelMovableObjectsExistence.append(mySpanDensityInit);
        myPanelMovableObjectsExistence.append(myInputFieldDensityInit);
        myPanelMovableObjectsExistence.append(document.createElement("br"));





        //Density End
        const mySpanDensityEnd = document.createElement("span");
        mySpanDensityEnd.setAttribute("class", "label2");
        mySpanDensityEnd.innerHTML = "Density End [0.0 - 1.0]";

        const myInputFieldDensityEnd = document.createElement("input");
        myInputFieldDensityEnd.setAttribute("class", "input");
        myInputFieldDensityEnd.setAttribute("type", "text");
        myInputFieldDensityEnd.setAttribute("id", "densityEnd");

        myPanelMovableObjectsExistence.append(mySpanDensityEnd);
        myPanelMovableObjectsExistence.append(myInputFieldDensityEnd);
        myPanelMovableObjectsExistence.append(document.createElement("br"));





        //Density Steps
        const mySpanDensitySteps = document.createElement("span");
        mySpanDensitySteps.setAttribute("class", "label2");
        mySpanDensitySteps.innerHTML = "Density Steps [e.g. 1, 2, 3...]";

        const myInputFieldDensitySteps = document.createElement("input");
        myInputFieldDensitySteps.setAttribute("class", "input");
        myInputFieldDensitySteps.setAttribute("type", "text");
        myInputFieldDensitySteps.setAttribute("id", "densitySteps");

        myPanelMovableObjectsExistence.append(mySpanDensitySteps);
        myPanelMovableObjectsExistence.append(myInputFieldDensitySteps);
        myPanelMovableObjectsExistence.append(document.createElement("br"));





        //Arming
        container.append(myPanelMovableObjectsExistence);

    }





    /**
    * This method creates the layer 2 Collapsible with its properties
    */
    createLayerCollapsible2() {

        //Leyend
        const myLayer = document.getElementById("legendlayer2");
        myLayer.innerHTML = "Link layer";

        const container = document.getElementById("panelLayer2")





        //Movable Object Flow
        const myPanelMovableFlow = document.createElement("div");
        myPanelMovableFlow.setAttribute("id", "panelInputLeft");

        const myPanelMovableFlowTitle = document.createElement("h5");
        myPanelMovableFlowTitle.innerHTML = "Movable Objects Flow";












        const mySpanNumberOfFrames = document.createElement("span");
        mySpanNumberOfFrames.setAttribute("class", "label2");
        mySpanNumberOfFrames.innerHTML = "Frames Number [e.g. 10, 20...]";

        const myInputFieldNumberOfFrames = document.createElement("input");
        myInputFieldNumberOfFrames.setAttribute("class", "input");
        myInputFieldNumberOfFrames.setAttribute("type", "text");
        myInputFieldNumberOfFrames.setAttribute("id", "numberOfFrames");




        myPanelMovableFlow.append(myPanelMovableFlowTitle);
        myPanelMovableFlow.append(mySpanNumberOfFrames);
        myPanelMovableFlow.append(myInputFieldNumberOfFrames);
        myPanelMovableFlow.append(document.createElement("br"));



        const mySpanInitialFramesToDiscard = document.createElement("span");
        mySpanInitialFramesToDiscard.setAttribute("class", "label2");
        mySpanInitialFramesToDiscard.innerHTML = "Initial Frames to Discard [Recommended 10]";

        const myInputInitialFramesToDiscard = document.createElement("input");
        myInputInitialFramesToDiscard.setAttribute("class", "input");
        myInputInitialFramesToDiscard.setAttribute("type", "text");
        myInputInitialFramesToDiscard.setAttribute("id", "framesDiscard");

        myPanelMovableFlow.append(mySpanInitialFramesToDiscard);
        myPanelMovableFlow.append(myInputInitialFramesToDiscard);
        myPanelMovableFlow.append(document.createElement("br"));
        myPanelMovableFlow.append(document.createElement("br"));

        const mySpanMovableMaxSpeed = document.createElement("span");
        mySpanMovableMaxSpeed.setAttribute("class", "label2");
        mySpanMovableMaxSpeed.innerHTML = "Movable Max Speed";

        const myInputFieldMovableMaxSpeed = document.createElement("input");
        myInputFieldMovableMaxSpeed.setAttribute("class", "input");
        myInputFieldMovableMaxSpeed.setAttribute("type", "text");
        myInputFieldMovableMaxSpeed.setAttribute("id", "movableMaxSpeed");





        myPanelMovableFlow.append(mySpanMovableMaxSpeed);
        myPanelMovableFlow.append(myInputFieldMovableMaxSpeed);
        myPanelMovableFlow.append(document.createElement("br"));

        const mySpanMovablePerformanceHighLimit = document.createElement("span");
        mySpanMovablePerformanceHighLimit.setAttribute("class", "label2");
        mySpanMovablePerformanceHighLimit.innerHTML = "Movable Performance High Limit";

        const myInputMovablePerformanceHighLimit = document.createElement("input");
        myInputMovablePerformanceHighLimit.setAttribute("class", "input");
        myInputMovablePerformanceHighLimit.setAttribute("type", "text");
        myInputMovablePerformanceHighLimit.setAttribute("id", "movablePerformanceHighLimit");

        myPanelMovableFlow.append(mySpanMovablePerformanceHighLimit);
        myPanelMovableFlow.append(myInputMovablePerformanceHighLimit);
        myPanelMovableFlow.append(document.createElement("br"));

        const mySpanMovablePerformanceLowLimit = document.createElement("span");
        mySpanMovablePerformanceLowLimit.setAttribute("class", "label2");
        mySpanMovablePerformanceLowLimit.innerHTML = "Movable Performance Low Limit";

        const myInputMovablePerformanceLowLimit = document.createElement("input");
        myInputMovablePerformanceLowLimit.setAttribute("class", "input");
        myInputMovablePerformanceLowLimit.setAttribute("type", "text");
        myInputMovablePerformanceLowLimit.setAttribute("id", "movablePerformanceLowLimit");

        myPanelMovableFlow.append(mySpanMovablePerformanceLowLimit);
        myPanelMovableFlow.append(myInputMovablePerformanceLowLimit);
        myPanelMovableFlow.append(document.createElement("br"));



        //Arming
        container.append(myPanelMovableFlow);



    }







        /**
    * This method creates the layer 2 Collapsible with its properties
    */
        createLayerCollapsible3() {

 

            const container = document.getElementById("panelRouter");


            // //Leyend
            // const myLegend = document.getElementById("legend" + contentID);
            // myLegend.innerHTML = "Routing layer";



    
            //Movable Object Flow
            // const myPanelMovableFlow = document.createElement("div");
            // myPanelMovableFlow.setAttribute("id", "panelInputLeft");
    
            // const myPanelMovableFlowTitle = document.createElement("h5");
            // myPanelMovableFlowTitle.innerHTML = "Movable Objects Flow";
    
    
    

            // const myPanelRouter = document.createElement("div");
            // myPanelRouter.setAttribute("id", "panelRouter");

            // container.append(myPanelRouter);




            const myRouter=new RoutingView();
    
            myRouter.createCollapsibleLinks(container);
    
    
    
    
    
    
    
    
            // const mySpanNumberOfFrames = document.createElement("span");
            // mySpanNumberOfFrames.setAttribute("class", "label2");
            // mySpanNumberOfFrames.innerHTML = "Frames Number [e.g. 10, 20...]";
    
            // const myInputFieldNumberOfFrames = document.createElement("input");
            // myInputFieldNumberOfFrames.setAttribute("class", "input");
            // myInputFieldNumberOfFrames.setAttribute("type", "text");
            // myInputFieldNumberOfFrames.setAttribute("id", "numberOfFrames");
    
    
    
    
            // myPanelMovableFlow.append(myPanelMovableFlowTitle);
            // myPanelMovableFlow.append(mySpanNumberOfFrames);
            // myPanelMovableFlow.append(myInputFieldNumberOfFrames);
            // myPanelMovableFlow.append(document.createElement("br"));
    
    
    
            // const mySpanInitialFramesToDiscard = document.createElement("span");
            // mySpanInitialFramesToDiscard.setAttribute("class", "label2");
            // mySpanInitialFramesToDiscard.innerHTML = "Initial Frames to Discard [Recommended 10]";
    
            // const myInputInitialFramesToDiscard = document.createElement("input");
            // myInputInitialFramesToDiscard.setAttribute("class", "input");
            // myInputInitialFramesToDiscard.setAttribute("type", "text");
            // myInputInitialFramesToDiscard.setAttribute("id", "framesDiscard");
    
            // myPanelMovableFlow.append(mySpanInitialFramesToDiscard);
            // myPanelMovableFlow.append(myInputInitialFramesToDiscard);
            // myPanelMovableFlow.append(document.createElement("br"));
            // myPanelMovableFlow.append(document.createElement("br"));
    
            // const mySpanMovableMaxSpeed = document.createElement("span");
            // mySpanMovableMaxSpeed.setAttribute("class", "label2");
            // mySpanMovableMaxSpeed.innerHTML = "Movable Max Speed";
    
            // const myInputFieldMovableMaxSpeed = document.createElement("input");
            // myInputFieldMovableMaxSpeed.setAttribute("class", "input");
            // myInputFieldMovableMaxSpeed.setAttribute("type", "text");
            // myInputFieldMovableMaxSpeed.setAttribute("id", "movableMaxSpeed");
    
    
    
    
    
            // myPanelMovableFlow.append(mySpanMovableMaxSpeed);
            // myPanelMovableFlow.append(myInputFieldMovableMaxSpeed);
            // myPanelMovableFlow.append(document.createElement("br"));
    
            // const mySpanMovablePerformanceHighLimit = document.createElement("span");
            // mySpanMovablePerformanceHighLimit.setAttribute("class", "label2");
            // mySpanMovablePerformanceHighLimit.innerHTML = "Movable Performance High Limit";
    
            // const myInputMovablePerformanceHighLimit = document.createElement("input");
            // myInputMovablePerformanceHighLimit.setAttribute("class", "input");
            // myInputMovablePerformanceHighLimit.setAttribute("type", "text");
            // myInputMovablePerformanceHighLimit.setAttribute("id", "movablePerformanceHighLimit");
    
            // myPanelMovableFlow.append(mySpanMovablePerformanceHighLimit);
            // myPanelMovableFlow.append(myInputMovablePerformanceHighLimit);
            // myPanelMovableFlow.append(document.createElement("br"));
    
            // const mySpanMovablePerformanceLowLimit = document.createElement("span");
            // mySpanMovablePerformanceLowLimit.setAttribute("class", "label2");
            // mySpanMovablePerformanceLowLimit.innerHTML = "Movable Performance Low Limit";
    
            // const myInputMovablePerformanceLowLimit = document.createElement("input");
            // myInputMovablePerformanceLowLimit.setAttribute("class", "input");
            // myInputMovablePerformanceLowLimit.setAttribute("type", "text");
            // myInputMovablePerformanceLowLimit.setAttribute("id", "movablePerformanceLowLimit");
    
            // myPanelMovableFlow.append(mySpanMovablePerformanceLowLimit);
            // myPanelMovableFlow.append(myInputMovablePerformanceLowLimit);
            // myPanelMovableFlow.append(document.createElement("br"));
    
    
    
            //Arming
            // container.append(myPanelMovableFlow);
    
    
    
        }
    



}





var compRes = new CompRes3LayersController();
