/* 
 * David Sanchez
 * Newcastle University
 * 
 * 2021 Mar 16: Created
 * 2021 Mar 25: Update
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
 * This is the Visualiser class. 
 * This class visualises the Position Network and resolution Network
 * - The Position Network is a cell arrangement
 * - The Restolution Network is a conseole.
 * 
 * e.g.
 * M is a movable commodity that travels through nodes using links
 * M occupies a block when travelling from one block to another
 * M departs from A and final destination is B
 * A and B are nodes.
 *  
 * Y
 * |   .   .   .   .   B  
 * |   .   .   .   .   .  
 * |   .   M   .   .   .  
 * |   .   .   .   .   .  
 * |   A   .   .   .   .  
 * |----------------------X 
 * 
 */


/**
 * This object is used to share variables between pages
 */
var _sharedObject;



class SimulationView {

    /**
     * It receives on the constructor the Stage
     * 
     * @param {Stage} stage 
     */
    constructor(simulationId, databank, config) {





        // ========================================================================== //
        // Privileged attributes
        this.simulationId = simulationId;

        //Databank
        this.databank = databank;


        //This is the configuration for exporting plot drawings
        this.config = config;

        // this.plotMaximumYValue = this.databank.common.plotMaximumYValue
        // this.plotMinimumYValue = this.databank.common.plotMinimumYValue;





        // ========================================================================== //
        // Private attributes
        //Pointer to communication channel
        _sharedObject.databank = this.databank;
        _sharedObject.config = this.config;

        this._gui = new GUI();

        this._that = this;



        // ========================================================================== //
        // Private methods






        // ========================================================================== //
        // Privileged methods




        this.init();
    }





    // ========================================================================== //
    // Public methods (Prototype methods)

    /**
     * This method deletes the interface
     */
    init() {


        //Deletes previous results
        const myResults = document.getElementById('results');
        if (myResults != null) {
            myResults.textContent = '';
        }


        // //Deletes previous results
        // const myLinks = document.getElementById('links');
        // if (myLinks != null) {
        //     myLinks.textContent = '';
        // }




        //Deletes collpasibles
        const myCollapsibles = document.getElementById('collapsibles');
        if (myCollapsibles != null) {
            myCollapsibles.textContent = '';
        }
    }





    /**
     * This code creates links to each simulation.
     * 
     * - The idea is to have all simulations in one page identified by iteration
     * - The user can click on a particular iteration to see how it was constructed
     * - The new iteration will appear in a new tab, so the user can see two or
     *   more iterations side by side. 
     *   e.g.
     * 
     *   1
     *   2
     *   3
     *   ...
     *   10000
     *   
     *   Each number is a hyperlink and will open another tab.
     *
     * @param {Array} densities 
     */
    createLinks(simulations, container, scenario) {

        const topSimulations = simulations.size;

        //Create HTML code dynamically
        for (let i = 0; i < topSimulations; i++) {

            //This creates the links to simulations    
            let myLink = document.createElement("BUTTON");
            myLink.innerHTML = i;


            myLink.setAttribute("simulationDetailId", i.toString());

            myLink.setAttribute("class", "button");
            myLink.setAttribute("scenario", scenario);
            myLink.setAttribute("simulationId", this.simulationId);


            //! I am working here
            //Adding behaviour
            myLink.addEventListener("click", this.openSimulationWindow.bind(Event), false);

            //Adds the link
            container.appendChild(myLink);
        }
    }





    /**
     * This code creates a link to a real Time simulation.
     * 
     * The simulation will use the resilience region found in the
     * scenario to plot the resilience region.  
     *
     * @param {Map} simulation
     * @param {DOM} contaner
     *
     */
    createRealTimeButton(container, scenario) {

        //This creates the links to simulations    
        let myButton = document.createElement("BUTTON");
        myButton.innerHTML = "Open Real Time for this scenario";

        myButton.setAttribute("id", "realTimeButton");
        myButton.setAttribute("class", "button");
        myButton.setAttribute("scenario", scenario);
        myButton.setAttribute("simulationId", this.simulationId);

        //Adding behaviour
        myButton.addEventListener("click", this.openRealTimeWindow.bind(Event), false);

        //Adds the link
        container.appendChild(myButton);

    }







    /**
     * This code creates a link to a real Time simulation.
     * 
     * The simulation will use the resilience region found in the
     * scenario to plot the resilience region.  
     *
     * @param {Map} simulations
     * @param {DOM} contaner
     *
     */
    createRealTimeButtonScenariosCombined(container) {

        //This creates the links to simulations    
        let myButton = document.createElement("BUTTON");
        myButton.innerHTML = "Open Real Time for combined scenarios";

        myButton.setAttribute("id", "realTimeButton");
        myButton.setAttribute("class", "button"); 
        // myButton.setAttribute("class", "link");

        myButton.setAttribute("simulationId", this.simulationId);

        //Adding behaviour
        myButton.addEventListener("click", this.openRealTimeWindow.bind(Event), false);

        //Adds the link
        container.appendChild(myButton);

    }










    //TODO Review if part or all of this method should be in the controller
    /**
     *  Opens a new windows with the relevant results
     * 
     *  This code is called is called in the master Window
     * 
     */
    openSimulationWindow(event) {


        let mySimulationId = event.target.getAttribute("simulationId");
        let myScenario = event.target.getAttribute("scenario");
        let mySimulationDetailId = event.target.getAttribute("simulationDetailId");

        let myURL = 'simulationDetail.html';
        _sharedObject.simulationId = mySimulationId;
        _sharedObject.scenarioId = myScenario;
        _sharedObject.simulationDetailId = mySimulationDetailId;

        //Cannot share this because "this" points to internal context
        _sharedObject.databank = simulation.databank;

        let mywindow = window.open(myURL, "_blank");
        mywindow.document.title = "Simulation Detail " + mySimulationDetailId;

    }





    //TODO Review if part or all of this method should be in the controller
    /**
     * Calls the controller to open a real time window for this scenario
     */
    openRealTimeWindow(event) {
        let mySimulationId = parseInt(event.target.getAttribute("simulationId"));
        let myScenario = parseInt(event.target.getAttribute("scenario"));


        //Call method in the controller
        simulation.createRealTimeViewer(mySimulationId, myScenario);



        // let mySimulationDetailId = parseInt(event.target.getAttribute("simulationDetailId"));

        // let myURL = 'simulationDetail.html';
        // _sharedObject.simulationId = mySimulationId;
        // _sharedObject.scenarioId = myScenario;
        // _sharedObject.simulationDetailId = mySimulationDetailId;

        // //Cannot share this because "this" points to internal context
        // _sharedObject.databank = simulation.databank;

        // let mywindow = window.open(myURL, "_blank");
        // mywindow.document.title = "Simulation Detail " + mySimulationDetailId;

    }








    /**
     * This method draws all results of the simulation
     */
    drawResults() {

        const numberOfScenarios = this.databank.common.numberOfScenarios;
        const config = this.config;
        const layout = {
            // yaxis: {
            //     range: [this.plotMinimumYValue, this.plotMaximumYValue]
            // },
            autosize: true,
            legend: {
                orientation: "v",
                traceorder: "normal"
            }
            // xaxis: {
            //     range: [initialFramesToDiscard, framesNumber]
            // },
            // colorway: myColorway,
            // title: 'Movable Velocity/Frame'
        };
        
        const container = document.getElementById('results');



        //Scenarios with more than on series in the plot
        this.drawResultsScenariosCombined(numberOfScenarios, config, layout, container);

        //Scenarios with only one series in the plot
        this.drawResultsScenariosSingle(numberOfScenarios, config, layout, container);

    }





    /**
     * It draws results that have a single result in the plot
     */
    drawResultsScenariosSingle(numberOfScenarios, config, layout, container) {


        //Drawing results for single scenarios
        for (let i = 0; i < numberOfScenarios; i++) {

            //Gathering Data
            let mySimulation = this.databank.scenarios.get(i.toString()).simulation;
            let myRegionTraces = this.databank.scenarios.get(i.toString()).regionTraces;

            //======================================================================
            //Collapsible
            // let contentID, panelName, panelLabel, panelLegend;

            let collapsibleID = "resultScenario" + i;
            let collapsiblePanelName = "panelResultScenario" + i;
            let collapsiblePanelLabel = "Scenario " + i + " Results";
            let collapsiblePanelLegend = "Scenario " + i + " Results";

            this._gui.collapsiblesCreateOneNoAnimated(
                container,
                collapsibleID,
                collapsiblePanelName,
                collapsiblePanelLabel,
                collapsiblePanelLegend)

            let contentID, panelName, panelLabel, panelLegend;

            let collapsibleContainer = document.getElementById(collapsibleID);





            //======================================================================
            //(Movable Flow)/Density Resilience Region

            contentID = "scenario" + i + ".resilienceRegion";
            panelName = "panelScenario" + i + ".resilienceRegion";
            panelLabel = "Scenario " + i + ". Resilience Region";
            panelLegend = "Scenario " + i + ". Result: (Movable Flow)/Density Resilience Region";

            this._gui.collapsiblesCreateOneNoAnimated(collapsibleContainer, contentID, panelName, panelLabel, panelLegend)
            this.drawResultsScenariosSingleResilienceRegion(contentID, mySimulation, myRegionTraces, layout, config);





            //======================================================================
            //(Movable Flow)/Density
            contentID = "scenario" + i + ".flow";
            panelName = "panelScenario" + i + ".flow";
            panelLabel = "Scenario " + i + ". Flow";
            panelLegend = "Scenario " + i + ". Result: (Movable Flow)/Density"

            this._gui.collapsiblesCreateOneNoAnimated(collapsibleContainer, contentID, panelName, panelLabel, panelLegend)
            this.drawResultsScenariosSingleFlow(mySimulation, contentID, layout, config);





            //======================================================================
            //(Movable Flow)/Density
            contentID = "scenario" + i + ".flowInRegion";
            panelName = "panelScenario" + i + ".flowInRegion";
            panelLabel = "Scenario " + i + ". Flow in Region";
            panelLegend = "Scenario " + i + ". Result: (Movable Flow)/Density in Resilience Region";



            this._gui.collapsiblesCreateOneNoAnimated(collapsibleContainer, contentID, panelName, panelLabel, panelLegend);
            this.drawResultsScenariosSingleFlowInRegion(mySimulation, contentID, myRegionTraces, layout, config);




            //======================================================================
            //Average Speed
            contentID = "scenario" + i + ".averageSpeed";
            panelName = "panelScenario" + i + ".averageSpeed";
            panelLabel = "Scenario " + i + ". Average Speed";
            panelLegend = "Scenario " + i + ". Result: Average Speed";



            this._gui.collapsiblesCreateOneNoAnimated(collapsibleContainer, contentID, panelName, panelLabel, panelLegend);
            this.drawResultsScenariosSingleSpeedAverage(mySimulation, contentID, config);





            //======================================================================
            //Simulation Links
            contentID = "scenario" + i + ".simulationDetails";
            panelName = "panelScenario" + i + ".simulationDetails";
            panelLabel = "Scenario " + i + ". Simulation Details";
            panelLegend = "Scenario " + i + ". Simulation Details";


            this._gui.collapsiblesCreateOneNoAnimated(collapsibleContainer, contentID, panelName, panelLabel, panelLegend);
            let linkContainer = document.getElementById(panelName);
            this.createLinks(mySimulation, linkContainer, i);



            //======================================================================
            //Real Time
            contentID = "scenario" + i + ".realTime";
            panelName = "panelScenario" + i + ".realTime";
            panelLabel = "Scenario " + i + ". Real Time";
            panelLegend = "Scenario " + i + ". Real Time";

            this._gui.collapsiblesCreateOneNoAnimated(collapsibleContainer, contentID, panelName, panelLabel, panelLegend);
            let realTimeContainer = document.getElementById(panelName);
            this.createRealTimeButton(realTimeContainer, i);


        }
    }





    /**
     * It draws results tha have more than one result in a plot
     */
    drawResultsScenariosCombined(numberOfScenarios, config, layout, container) {




        //======================================================================
        //Collapsible
        // let contentID, panelName, panelLabel, panelLegend;

        let collapsibleID = "resultCombined";
        let collapsiblePanelName = "panelResultCombined";
        let collapsiblePanelLabel = "Scenarios Combined";
        let collapsiblePanelLegend = "Scenarios Combined";

        this._gui.collapsiblesCreateOneNoAnimated(
            container,
            collapsibleID,
            collapsiblePanelName,
            collapsiblePanelLabel,
            collapsiblePanelLegend)



        let contentID, panelName, panelLabel, panelLegend;

        let collapsibleContainer = document.getElementById(collapsibleID);






        //======================================================================
        //Results Combined: (Movable Flow)/Density in Resilience Region
        contentID = "scenarioCombined.resilienceRegion";
        panelName = "panelScenarioCombined.resilienceRegion";
        panelLabel = "Scenarios Combined. Resilience Region";
        panelLegend = "Scenarios Combined. Resilience Region";

        this._gui.collapsiblesCreateOneNoAnimated(collapsibleContainer, contentID, panelName, panelLabel, panelLegend);
        const resilienceRegionContainer = document.getElementById(panelName);
        this.drawResultsScenariosCombinedResilienceRegion(numberOfScenarios, resilienceRegionContainer, layout, config)





        //======================================================================
        //Results Combined: Average Speed
        contentID = "scenarioCombined.averageSpeed";
        panelName = "panelScenarioCombined.averageSpeed";
        panelLabel = "Scenarios Combined. Average Speed";
        panelLegend = "Scenarios Combined. Average Speed";

        this._gui.collapsiblesCreateOneNoAnimated(collapsibleContainer, contentID, panelName, panelLabel, panelLegend);
        const averageSpeedContainer = document.getElementById(panelName);
        this.drawResultsScenariosCombinedSpeedAverage(numberOfScenarios, averageSpeedContainer, config);





        //======================================================================
        //Results Combined: Real Time
        contentID = "scenarioCombined.realTime";
        panelName = "panelScenarioCombined.realTime";
        panelLabel = "Scenarios Combined. Real Time";
        panelLegend = "Scenarios Combined. Real Time";

        this._gui.collapsiblesCreateOneNoAnimated(collapsibleContainer, contentID, panelName, panelLabel, panelLegend);
        const realTimeContainer = document.getElementById(panelName);

  
        this.createRealTimeButtonScenariosCombined(realTimeContainer);

    }





    /**
     * This method draws all flow results of the simulator
     * 
     */
    drawResultsScenariosSingleFlow(simulations, container, layout, config) {

        const topIterations = simulations.size;

        const traces = new Map();

        for (let i = 0; i < topIterations; i++) {

            //Getting each iteration of a simulation
            
            
            let simulation = simulations.get(i.toString());

            let densities = Array.from(simulation.keys());

            let topDensities = densities.length;

            //Create a new object trace to store results to be collected
            let myTrace = {
                x: new Array(),
                y: new Array(),
                mode: 'lines+markers',
                line: {
                    shape: 'spline'
                },
                type: 'scatter',
                name: i,
            };

            for (let j = 0; j < topDensities; j++) {

                //Traversing all densities in a simulation
                let totalMovablesCrossedFinishLine = simulation.get(densities[j].toString()).totalMovablesCrossedFinishLine;

                myTrace.x.push(densities[j]);
                myTrace.y.push(totalMovablesCrossedFinishLine);
            }

            //Adding the new series to the traces using the iteration i as key

            traces.set(i.toString(), myTrace);

        }


        const data = [...traces.values()];

        Plotly.newPlot(container, data, layout, config);
    }





    /**
     * This method draws all flow results of the simulator
     * 
     */
    drawResultsScenariosSingleResilienceRegion(container, simulation, traces, layout, config) {

        let data = new Array();

        let myData = this.createDataResultsFlowInRegion(simulation, traces);

        data.push(myData[0]);
        data.push(myData[1]);

        Plotly.newPlot(container, data, layout, config);

    }





    /**
     * This method draws all flow results of the simulator
     * 
     */
    drawResultsScenariosSingleFlowInRegion(simulations, container, traces, layout, config) {

        const myTraceMax = traces.get("0");
        
        //Adding graph parameters to the same structure
        myTraceMax.mode = 'lines+markers';
        myTraceMax.fill = 'tozero';
        myTraceMax.line = {
            shape: 'spline'
        };
        myTraceMax.type = {
            shape: 'scatter'
        };



        const myTraceMin = traces.get("1");
        
        //Adding graph parameters to the same structure
        myTraceMin.mode = 'lines+markers';
        myTraceMin.fill = 'tonexty';
        myTraceMin.line = {
            shape: 'spline'
        };
        myTraceMin.type = {
            shape: 'scatter'
        };


        const topSimulations = simulations.size;



        //Producing dataset for all series
        for (let i = 0; i < topSimulations; i++) {

            //Getting each iteration of a simulation
            let simulation = simulations.get(i.toString());

            let densities = Array.from(simulation.keys());

            let topDensities = densities.length;

            //Create a new object trace to store results to be collected
            let myTrace = {
                x: new Array(),
                y: new Array(),
                mode: 'lines+markers',
                line: {
                    shape: 'spline'
                },
                type: 'scatter',
                name: i,
            };

            for (let j = 0; j < topDensities; j++) {

                //Traversing all densities in a simulation
                let totalMovablesCrossedFinishLine = simulation.get(densities[j].toString()).totalMovablesCrossedFinishLine;

                //Saves the value into its respective series
                myTrace.x.push(densities[j]);
                myTrace.y.push(totalMovablesCrossedFinishLine);

            }

            //Adding the new series to the traces using the iteration i as key
            let k = i + 2;
            traces.set(k.toString(), myTrace);
 
        }

        const data = [...traces.values()];

        Plotly.newPlot(container, data, layout, config);


    }





    /**
     * This method creates a data set of the results flow in region.
     * I need to call this procedure twice tocreate two datasets
     * One of the is for the control, the other is for the attack
     * 
     * @param {Map} simulations 
     * @returns Array
     */
    createDataResultsFlowInRegion(simulations, traces) {


        const myTraceMax = traces.get("0");

        //Adding graph parameters to the same structure
        myTraceMax.mode = 'lines+markers';
        myTraceMax.fill = 'tozero';
        myTraceMax.line = {
            shape: 'spline'
        };
        myTraceMax.type = {
            shape: 'scatter'
        };





        const myTraceMin = traces.get("1");        

        //Adding graph parameters to the same structure
        myTraceMin.mode = 'lines+markers';
        myTraceMin.fill = 'tonexty';
        myTraceMin.line = {
            shape: 'spline'
        };
        myTraceMin.type = {
            shape: 'scatter'
        };


        const topSimulations = simulations.size;


        //Producing dataset for all series
        for (let i = 0; i < topSimulations; i++) {

            //Getting each iteration of a simulation
            let simulation = simulations.get(i.toString());

            let densities = Array.from(simulation.keys());

            let topDensities = densities.length;

            //Create a new object trace to store results to be collected
            let myTrace = {
                x: new Array(),
                y: new Array(),
                mode: 'lines+markers',
                line: {
                    shape: 'spline'
                },
                type: 'scatter',
                name: i,
            };

            for (let j = 0; j < topDensities; j++) {

                //Traversing all densities in a simulation


                let totalMovablesCrossedFinishLine = simulation.get(densities[j].toString()).totalMovablesCrossedFinishLine;

                //Saves the value into its respective series
                myTrace.x.push(densities[j]);
                myTrace.y.push(totalMovablesCrossedFinishLine);

            }



            //Adding the new series to the traces using the iteration i as key
            let k = i + 2;
            traces.set(k.toString(), myTrace);

        }


        const data = [...traces.values()];

        return data

    }





    /**
     * This method draws all flow results of the simulator
     * 
     */
    drawResultsScenariosCombinedResilienceRegion(numberOfScenarios, container, layout, config) {



        let data = new Array();

        for (let i = 0; i < numberOfScenarios; i++) {


            //Gathering Data
            let mySimulation = this.databank.scenarios.get(i.toString()).simulation;
            let myRegionTraces = this.databank.scenarios.get(i.toString()).regionTraces;

            let myData = this.createDataResultsFlowInRegion(mySimulation, myRegionTraces);

            data.push(myData[0]);
            data.push(myData[1]);





            //This next code adds all series. 
            //However, it makes the resilience region
            //very difficult to distinguish from others.
            //I will leave the code here it case that I need it.
            // myData = myData.slice(2, myData.length);
            // data = data.concat(myData);

        }

        Plotly.newPlot(container, data, layout, config);
    }





    /**
     * This method draws speed average of each iteration.
     * 
     * Each iteration of a simulation has an average speed.
     * This method shows the average speed of those average speeds. 
     * 
     */
    drawResultsScenariosSingleSpeedAverage(simulations, container, config) {

        const topSimulations = simulations.size;

        const myTotalAverageX = new Array();
        const myTotalAverageY = new Array();

        //Producing dataset for all series
        for (let i = 0; i < topSimulations; i++) {

            //Getting each iteration of a simulation

            let simulation = simulations.get(i.toString());            
            
            let densities = Array.from(simulation.keys());

            let topDensities = densities.length;

            for (let j = 0; j < topDensities; j++) {

                //Traversing all densities in a simulation
                let averageSpeed = simulation.get(densities[j].toString()).averageSpeed;

                //Creating dataset for total box plot
                //Saves the value with its respective density
                myTotalAverageX.push(densities[j]);
                myTotalAverageY.push(averageSpeed);
            }
        }




        //Overriding layout parameters with a different plot
        //Common parameters
        const layoutBox = {
            yaxis: {
                range: [0, 5]
            },
            autosize: true,
            legend: {
                orientation: "v",
                traceorder: "normal"
            }
        };


        const trace = {
            colorway: this.colorway,
            x: myTotalAverageX,
            y: myTotalAverageY,
            type: 'box',
            name: 'Velocity',
            boxmean: true
        };

        const data = [trace];

        Plotly.newPlot(container, data, layoutBox, config);


    }





    /**
     * This refreshes the configuration
     */
    updateConfig() {

        this.config = _sharedObject.config;
    }





    /**
     * This method creates only a data set of the speed average of a simulation.
     * I need to call this procedure twice tocreate two datasets
     * One of the is for the control, the other is for the attack
     * 
     * @param {Map} simulations 
     * @returns Array
     */
    createResultsSpeedAverageCombined(simulations, label) {

        const topSimulations = simulations.size;

        const myTotalAverageX = new Array();
        const myTotalAverageY = new Array();

        //Producing dataset for all series
        for (let i = 0; i < topSimulations; i++) {

            //Getting each iteration of a simulation

            let simulation = simulations.get(i.toString());
            
            let densities = Array.from(simulation.keys());

            let topDensities = densities.length;

            for (let j = 0; j < topDensities; j++) {

                //Traversing all densities in a simulation
                let averageSpeed = simulation.get(densities[j]).averageSpeed;

                //Creating dataset for total box plot
                //Saves the value with its respective density
                myTotalAverageX.push(densities[j]);
                myTotalAverageY.push(averageSpeed);
            }
        }

        const trace = {
            colorway: this.colorway,
            x: myTotalAverageX,
            y: myTotalAverageY,
            type: 'box',
            name: label,
            boxmean: true
        };

        const data = [trace];

        return data
    }





    /**
     * This method draws speed average of each iteration.
     * 
     * Each iteration of a simulation has an average speed.
     * This method shows the average speed of those average speeds. 
     * 
     */
    drawResultsScenariosCombinedSpeedAverage(numberOfScenarios, container, config) {

        let data = new Array();

        for (let i = 0; i < numberOfScenarios; i++) {

            //Gathering Data
            let mySimulation = this.databank.scenarios.get(i.toString()).simulation;
            
            let myData = this.createResultsSpeedAverageCombined(mySimulation, "Scenario " + i);

            data = data.concat(myData);
        }


        //Overriding layout parameters with a different plot
        //Common parameters
        const layoutBox = {
            yaxis: {
                range: [0, 5]
            },
            autosize: true,
            legend: {
                orientation: "v",
                traceorder: "normal"
            }
        };





        Plotly.newPlot(container, data, layoutBox, config);
    }







}