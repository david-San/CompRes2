/* 
 * David Sanchez
 * Newcastle University
 * 
 * 2023 Mar 16: Created
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
 * This is the Visualiser Real Time class. 
 * This class is used to visualise real time simulations.
 * 
 * The class isolates all the code related to the visualisation.
 * 
 * First, it draws the empty canvas.
 * Then, it uses public methods to handle the updates mimicing the
 * sending messages to a visualisation server.
 * 
 */





class RoutingView {

    /**
     * It receives on the constructor the Stage
     * 
     * @param {Stage} stage 
     */
    constructor() {





        // ========================================================================== //
        // Privileged attributes

        // let _sharedObject = window.opener._sharedObject;

        //Databank
        // this.databank = _sharedObject.databank;
        // this.simulationId = _sharedObject.simulationId;
        // this.scenario = _sharedObject.scenario;
        // this.numberOfScenarios = this.databank.common.numberOfScenarios;


        // this.realTimeSimulationId = _sharedObject.realTimeSimulationId;

        //Configuration for exporting plot drawings
        // this.config = _sharedObject.config;
        // this.kind = _sharedObject.kind;
        // this.id = _sharedObject.id;






        // this.container = document.getElementById('realTimeSimulation');

        // this.x = 0;

        // this.plotMaximumYValue = this.databank.common.plotMaximumYValue
        // this.plotMinimumYValue = this.databank.common.plotMinimumYValue;


        // this.dynamicTickvals = [];
        // this.dynamicTicktext = [];

        this.currentLinkRow = 1;


        // ========================================================================== //
        // Private attributes

        this._gui = new GUI();



        // ========================================================================== //
        // Private methods





        // ========================================================================== //
        // Privileged methods


        // this.init();



    }




    // ========================================================================== //
    // Public methods (Prototype methods)





    /** 
     * This method inits the interface
     */
    // init() {

    //     if (!isNaN(_sharedObject.scenario)) {

    //         //If _sharedObject.scenario is NaN, this is a combined scenario, so no resilience region for a particular scenario
    //         const myTitle = "Simulation " + this.simulationId + ". Scenario " + this.scenario + ". Real time " + this.realTimeSimulationId;
    //         document.title = myTitle;
    //         document.getElementById("simulationTitle").innerHTML = myTitle;

    //     } else {
    //         const myTitle = "Simulation " + this.simulationId + ". Scenarios Combined" + ". Real time " + this.realTimeSimulationId;
    //         document.title = myTitle;
    //         document.getElementById("simulationTitle").innerHTML = myTitle;
    //     }





    //     //Additional visual components
    //     this.drawDynamicResilienceRegionInit();
    //     this.collapsiblesCreateAll();
    // }





    /**
       * This code creates the collapsible interface.
       * 
       * - The idea is to have all th e frames into one page and once you click
       *   on a collapsible, it will show the relevant data.
       * 
       * - This is faster than showing all the frames inr real time.
       *  
       * - Densities are passed inside an array.
       *   e.g. [0.1,0.2,0.3,0.4,0.5]
       *   and it will draw an interface with colapsible items
       * 
       *   /------\ 
       *   |Frames|
       *   |      -------------------------
       *   | Collapsible  content for 0.5 |
       *   |-------------------------------
       * 
       * 
       *  Taken from: https://www.w3schools.com/howto/howto_js_collapsible.asp
       *
       * 
       * @param {Integer} id of the simulation iteration
       */
    collapsiblesCreateAll() {

        //Main anchor point to the interface
        const container = document.getElementById("collapsibles");



        //Draw the panels
        //They are created in the order they are called

        if (isNaN(_sharedObject.scenario)) {

            //If _sharedObject.scenario is NaN, this is a combined scenario, so instead of resilience region I put controls to combine scenarios           
            this.collapsiblesCreateOne(container, "contentScenariosCombinedControls", "panelScenariosCombinedControl", "Scenarios Combined. Transition Controls", "");

        } else {
            //If _sharedObject.scenario is NaN, this is a combined scenario, so no resilience region for a particular scenario
            this.collapsiblesCreateOne(container, "contentResilienceRegion", "panelResilienceRegion", "Resilience Region", "");
        }

        //These collapsibles are common to all cases
        this.collapsiblesCreateOne(container, "contentScenarioCombinedResilienceRegion", "panelScenarioCombinedResilienceRegion", "Scenario Combined. Resilience Region", "");
        this.collapsiblesCreateOne(container, "contentAnimation", "panelAnimation", "Animation", "");
        this.collapsiblesCreateOne(container, "contentFramesHighlightTraffic", "panelFramesHighlightTraffic", "Frames Highlight Traffic", "Min. Velocity: 0. Max. Velocity: 5. Colours assigned by velocity.");
        this.collapsiblesCreateOne(container, "contentFramesHighlightMovable", "panelFramesHighlightMovable", "Frames Highlight Movable", "Min. Velocity: 0. Max. Velocity: 5. Colours identify movables.");

        //Assign behaviour to all collapsibles created
        this.collapsiblesAssignBehaviour();
    }





    /**
     * Create one single collapsible item and add it to the container
     * 
     * Structure:
     * 
     *    - Collapsible Button
     *    - Collapsible Content
     *        + Collapsible Panel Legend
     *        + Collapsible Panel
     * 
     * @param {DOM} container 
     * @param {String} contentID 
     * @param {String} panelName
     * @param {String} panelLabel
     * @param {String} panelLegend 
     */
    collapsiblesCreateOne(container, contentID, panelName, panelLabel, panelLegend) {


        //Collapsible Button
        const myCollapsibleButton = document.createElement("button");
        myCollapsibleButton.innerHTML = panelLabel;
        myCollapsibleButton.setAttribute("type", "button");
        myCollapsibleButton.setAttribute("class", "collapsible");


        //Collapsible Content
        const myCollapsibleContent = document.createElement("div");
        myCollapsibleContent.setAttribute("class", "content");
        myCollapsibleContent.setAttribute("id", contentID);


        //Collapsible Panel Legend
        const myDivCollapsiblePanelLegend = document.createElement("legend");
        myDivCollapsiblePanelLegend.innerHTML = panelLegend;


        //Collapsible Panel
        const myDivCollapsiblePanel = document.createElement("div");
        myDivCollapsiblePanel.setAttribute("id", panelName);
        myDivCollapsiblePanel.setAttribute("class", "panelCenter");


        //Arming the DOM
        container.append(myCollapsibleButton);
        container.append(myCollapsibleContent);
        myCollapsibleContent.append(myDivCollapsiblePanelLegend);
        myCollapsibleContent.append(myDivCollapsiblePanel);

    }





    /**
     * Assigns behaviour to all collapsibles
     * 
     * This is the method that has to be modified to assign behaviours when
     * the collapsible is shown,
     * 
     */
    collapsiblesAssignBehaviour() {

        //Assign behaviour
        const myCollapsible = document.getElementsByClassName("collapsible");
        const topCollapsible = myCollapsible.length;

        for (let i = 0; i < topCollapsible; i++) {

            myCollapsible[i].addEventListener("click", function () {
                this.classList.toggle("active");
                var content = this.nextElementSibling;
                if (content.style.maxHeight) {

                    content.style.maxHeight = null;
                    realTime.SetFlagNotToDrawCollapsibleFrames();

                } else {

                    if (content.id === "contentFramesHighlightTraffic") {

                        //Tell the controller to draw the frames
                        realTime.SetFlagToDrawCollapsibleFramesTraffic();

                        //Update size of the collapsible
                        content.style.maxHeight = content.scrollHeight + "px";

                    } else if (content.id === "contentFramesHighlightMovable") {

                        //Tell the controller to draw the frames
                        realTime.SetFlagToDrawCollapsibleFramesMovable();

                        //Update size of the collapsible
                        content.style.maxHeight = content.scrollHeight + "px";

                    } else if (content.id === "contentAnimation") {

                        //Tell the controller to load the player
                        realTime.loadPlayer();

                        //The collapsible size update is performed by the loadPlayer

                    } else {

                        //Update size of the collapsible
                        content.style.maxHeight = content.scrollHeight + "px";

                    };
                }
            });
        }
    }





    /**
     * This method drawas the animation panel.
     * This panel should be inside the collapsible
     */
    createCollapsibleLinks(container) {

        //Getting the container panel
        // const container = document.getElementById('panelRouter');

        //Add button   
        const myAddButton = document.createElement("BUTTON");
        myAddButton.innerHTML = "Add Link";
        myAddButton.setAttribute("id", "addLink");
        myAddButton.setAttribute("class", "button");

        //Adding behaviour
        //I have to bind this into the function to be able to access the outer methods using this.
        myAddButton.addEventListener("click", this.addLink.bind(this), false);

        //Adds the link
        container.appendChild(myAddButton);





        //Delete button
        let myDeleteButton = document.createElement("BUTTON");
        myDeleteButton.innerHTML = "Delete selected links";
        myDeleteButton.setAttribute("id", "deleteScenario");
        myDeleteButton.disabled = true;


        //Adding behaviour
        myDeleteButton.addEventListener("click", this.deleteSelectedLinks.bind(this), false);

        //Adds the link
        container.appendChild(myDeleteButton);



        //Adding a canvas
        const panelLinksScrollArea = document.createElement("div");
        panelLinksScrollArea.setAttribute("class", "panelLinksScrollArea");
        panelLinksScrollArea.setAttribute("id", "panelLinksScrollArea");


        //Adding a row panel
        const panelRows = document.createElement("div");
        panelRows.setAttribute("class", "child");
        panelRows.setAttribute("id", "panelLinksRows");



        container.appendChild(panelLinksScrollArea);
        panelLinksScrollArea.appendChild(panelRows);


        //Adding first row. Scenario 0
        // this.addScenario();

    }




    //TODO Review if part or all of this method should be in the controller
    /**
     * This adds a scenario
     */
    addLink() {

        //Current couter
        const i = this.currentLinkRow;

        //Increase the counter
        this.currentLinkRow = this.currentLinkRow + 1;
        
        const row = document.createElement("div");
        row.setAttribute("id", "row" + i);



        //======================================================================
        const container = document.getElementById('panelLinksRows');
        container.appendChild(row);



        const myName = "Link";





        //=====================================================================
        //Create the accordion link
        let ID = "link" + i;
        let panelName = "panelLink" + i;
        let panelLabel = "Link " + i;
        let panelLegend = "Link " + i;

        //Creates and appends the accordion panel
        this._gui.collapsiblesCreateOne(row, ID, panelName, panelLabel, panelLegend);
        this._gui.collapsiblesAssignBehaviour();


        //myAccordion show
        const myAccordion = document.getElementById(ID);
        // myAccordion.classList.toggle("active"); 

        myAccordion.style.maxHeight = 'max-content';



        const contentPanel = document.getElementById(panelName);

        //==============================================================Checkbox
        //creating checkbox attribute

        const myCheckBox = document.createElement("input");
        myCheckBox.setAttribute("type", "checkbox");

        myCheckBox.setAttribute("id", myName + "Checkbox" + i);
        myCheckBox.setAttribute("class", "checkboxLink");
        myCheckBox.setAttribute("name", myName + "Checkbox");

        //It adds and event listener to enable and disable the delete button
        myCheckBox.addEventListener("change", this.enableDisableDeleteButton.bind(this), false);

        //Append the label to the separator
        contentPanel.appendChild(myCheckBox);





        //============================================================Label:Name
        const mySpanStartsOnFrame = document.createElement("span");
        mySpanStartsOnFrame.setAttribute("class", "label3");
        mySpanStartsOnFrame.innerHTML = "Link Name ";

        //Append the label to the separator
        contentPanel.appendChild(mySpanStartsOnFrame);

        const myInputFieldTransitionFrame = document.createElement("input");
        myInputFieldTransitionFrame.setAttribute("class", "input");
        myInputFieldTransitionFrame.setAttribute("type", "text");
        myInputFieldTransitionFrame.setAttribute("id", myName + "Frame" + i);


        //Append the label to the separator
        contentPanel.appendChild(myInputFieldTransitionFrame);





        //========================================================Label:Scenario
        const mySpan = document.createElement("span");
        mySpan.setAttribute("class", "label3");
        mySpan.innerHTML = "JSON Router ";

        //Append the label to the separator
        contentPanel.appendChild(mySpan);

        const myInputFieldTransitionScenario = document.createElement("input");
        myInputFieldTransitionScenario.setAttribute("class", "input");
        myInputFieldTransitionScenario.setAttribute("type", "text");
        myInputFieldTransitionScenario.setAttribute("id", myName + "Scenario" + i);

        //Append the label to the separator
        contentPanel.appendChild(myInputFieldTransitionScenario);





        //==============================================================Checkbox
        let myKeepLoop = document.createElement("span");
        myKeepLoop.setAttribute("class", "label3");
        myKeepLoop.innerHTML = "Keep Loop ";

        //Append the label to the separator
        contentPanel.appendChild(myKeepLoop);

        //creating checkbox attribute
        const myCheckBoxKeepLoop = document.createElement("input");
        myCheckBoxKeepLoop.setAttribute("type", "checkbox");

        myCheckBoxKeepLoop.setAttribute("id", myName + "Checkbox" + i);
        myCheckBoxKeepLoop.setAttribute("class", "checkboxElement");
        myCheckBoxKeepLoop.setAttribute("name", myName + "Checkbox");

        //It adds and event listener to enable and disable the delete button
        myCheckBoxKeepLoop.addEventListener("change", this.enableDisableDeleteButton.bind(this), false);

        //Append the label to the separator
        contentPanel.appendChild(myCheckBoxKeepLoop);





        //Append Layers
        //========================================================Layers
        // let layersName = "layers" + myName+i;
        // let myDivLayers = document.createElement("div");
        // myDivLayers.setAttribute("id", layersName);

    
        // contentPanel.appendChild(myDivLayers);






        this.createLayerCollapsible2(contentPanel, ID );
        this.createLayerCollapsible1(contentPanel, ID );



   




        //Update size of the collapsible
        // const content = document.getElementById("contentScenariosCombinedControls");
        // content.style.maxHeight = content.scrollHeight + "px";


        //Accordion hide
        // myAccordion.style.maxHeight = null;



    }









    
    

    
    
    
    
    
    
    /**
     * This method creates the layer 1 Collapsible with its properties
     */
    createLayerCollapsible1(container, ID) {

        const i = 1;
        
        const contentID = ID + "Layer" + i;
        const panelName = ID + "panelLayer" + i;
        // const panelLabel = " Layer " + i + " [" + ID + "]";
        const panelLabel = " Layer " + i;
        const panelLegend = "legend" + ID + "Layer" + i;

        //Creates and appends the accordion panel
        this._gui.collapsiblesCreateOne(container, contentID, panelName, panelLabel, panelLegend);
        this._gui.collapsiblesAssignBehaviour();
        // this._gui.collapsibleAssignBehaviourNoAnimated();



        //Updating legend
        const legend = document.getElementById(panelLegend);
        legend.innerHTML = "Physical layer: Existence of components";


        const contentPanel = document.getElementById(panelName);


        contentPanel.setAttribute("class", "panelCenterWhite");



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
        contentPanel.append(myPanelLinkExistence);





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
        contentPanel.append(myPanelMovableObjectsExistence);

    }





    /**
    * This method creates the layer 2 Collapsible with its properties
    */
    createLayerCollapsible2(container, ID) {

        const i = 2;

        const contentID = ID + "Layer" + i;
        const panelName = ID + "panelLayer" + i;
        // const panelLabel = " Layer " + i + " [" + ID + "]";
        const panelLabel = " Layer " + i;
        const panelLegend = "legend" + ID + "Layer" + i;

        //Creates and appends the accordion panel
        this._gui.collapsiblesCreateOne(container, contentID, panelName, panelLabel, panelLegend);
        // this._gui.collapsibleAssignBehaviourNoAnimated();

        this._gui.collapsiblesAssignBehaviour();

         //Updating legend
        const legend = document.getElementById(panelLegend);
        legend.innerHTML = "Link layer: Flow behaviour";


        const contentPanel = document.getElementById(panelName);


        contentPanel.setAttribute("class", "panelCenterWhite");



        //======================================================================
        //Movable Object Flow
        // const myPanelMovableFlow = contentPanel;

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
        contentPanel.append(myPanelMovableFlow);



    }




    /**
     * This deletes a scenario
     */
    deleteSelectedLinks() {

        const x = window.confirm("Are you sure you want to delete the selected link(s)?");

        if (x) {
            //Reference to checkbox
            const checkboxes = document.getElementsByClassName("checkboxLink");
            //const top = checkboxes.length;

            //Changing loop names
            for (let i = 0, top = checkboxes.length; i < top; i++) {

                if (checkboxes[i].checked) {

                    const checkbox = checkboxes[i];
                    let id = checkbox.id;


                    //+ is Unary plus (Convert String to integer)
                    id = +id.replace("LinkCheckbox", "");

                    //Removing element
                    document.getElementById("row" + id).remove();

                    //Adjusting the index and array, since after removing is
                    i--;
                    top--;


                    this.enableDisableDeleteButton();
                }
            }
        }
    }







    /**
     * Enable/Disable the delete Scenarios button if something is selected
     */
    enableDisableDeleteButton() {

        //Reference to checkbox
        const checkboxes = document.getElementsByClassName("checkboxLink");

        for (let i = 0, length = checkboxes.length; i < length; i++) {
            if (checkboxes[i].checked) {

                //Updates the delete button status
                const deleteButton = document.getElementById("deleteScenario");
                deleteButton.disabled = false;
                break;
            } else {
                //Updates the delete button status
                const deleteButton = document.getElementById("deleteScenario");
                deleteButton.disabled = true;
            }
        }


        if (checkboxes.length === 0) {
            const deleteButton = document.getElementById("deleteScenario");
            deleteButton.disabled = true;
        }
    }














 





}