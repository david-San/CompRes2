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





class RealTimeView {

    /**
     * It receives on the constructor the Stage
     * 
     * @param {Stage} stage 
     */
    constructor() {





        // ========================================================================== //
        // Privileged attributes

        let _sharedObject = window.opener._sharedObject;

        //Databank
        this.databank = _sharedObject.databank;
        this.simulationId = _sharedObject.simulationId;
        this.scenario = _sharedObject.scenario;
        this.numberOfScenarios = this.databank.common.numberOfScenarios;


        this.realTimeSimulationId = _sharedObject.realTimeSimulationId;

        //Configuration for exporting plot drawings
        this.config = _sharedObject.config;
        // this.kind = _sharedObject.kind;
        // this.id = _sharedObject.id;






        this.container = document.getElementById('realTimeSimulation');

        this.x = 0;

        this.plotMaximumYValue = this.databank.common.plotMaximumYValue
        this.plotMinimumYValue = this.databank.common.plotMinimumYValue;


        this.dynamicTickvals = [];
        this.dynamicTicktext = [];

        this.currentScenarioRow = 0;


        // ========================================================================== //
        // Private attributes





        // ========================================================================== //
        // Private methods





        // ========================================================================== //
        // Privileged methods


        this.init();



    }




    // ========================================================================== //
    // Public methods (Prototype methods)





    /** 
     * This method inits the interface
     */
    init() {

        if (!isNaN(_sharedObject.scenario)) {

            //If _sharedObject.scenario is NaN, this is a combined scenario, so no resilience region for a particular scenario
            const myTitle = "Simulation " + this.simulationId + ". Scenario " + this.scenario + ". Real time " + this.realTimeSimulationId;
            document.title = myTitle;
            document.getElementById("simulationTitle").innerHTML = myTitle;

        } else {
            const myTitle = "Simulation " + this.simulationId + ". Scenarios Combined" + ". Real time " + this.realTimeSimulationId;
            document.title = myTitle;
            document.getElementById("simulationTitle").innerHTML = myTitle;
        }





        //Additional visual components
        this.drawDynamicResilienceRegionInit();
        this.collapsiblesCreateAll();
    }





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
     * 
     * This method draws the resilience region panel
     * 
     * @param {Array} traces 
     */
    drawCollapsibleResilienceRegion(traces) {

        const config = this.config;

        //Common parameters
        const layout = {
            yaxis: {
                range: [this.plotMinimumYValue, this.plotMaximumYValue]
            },
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





        //======================================================================
        //Getting references
        // const divResults = document.getElementById('results');


        const divResilienceRegion = document.getElementById('panelResilienceRegion');




        //======================================================================
        //Control Result: (Movable Flow)/Density Resilience Region
        //Control
        //Adding the legend to the DOM
        const legendControlFlowRegion = document.createElement("legend");
        legendControlFlowRegion.setAttribute("class", "legend");
        legendControlFlowRegion.innerHTML = "(Movable Flow at n-Frames) vs (Density Resilience Region)";

        //Adding a panel to place results
        const divControlFlowRegionResults = document.createElement("div");
        divControlFlowRegionResults.setAttribute("id", "performanceFlowRegionControlResults");
        divControlFlowRegionResults.setAttribute("class", "panelPerformance");

        //Arming the DOM
        divResilienceRegion.append(legendControlFlowRegion);
        divResilienceRegion.append(divControlFlowRegionResults);

        const containerResilienceRegion = document.getElementById('performanceFlowRegionControlResults');
        this.drawResilienceRegion(containerResilienceRegion, traces, layout, config);

    }





    /** 
     * This method draws the resilience region
     * (Flow resilience region)
     * 
     * @param {div} container 
     * @param {Array} traces 
     * @param {Object} layout 
     * @param {Object} config 
     */
    drawResilienceRegion(container, traces, layout, config) {


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



        const myTraces = new Map();

        myTraces.set("0", myTraceMax);
        myTraces.set("1", myTraceMin)

        const data = [...myTraces.values()];

        Plotly.newPlot(container, data, layout, config);

    }





    /**
     * 
     * TODO Try to unify similar methods. This is similar to the one in Simulationview
     * 
     * This method draws the combined resilience region panel
     * 
     * @param {Array} resilienceTraces 
     * @param {Array} attackTraces 
     */
    drawCollapsibleResilienceRegionCombined() {

        const config = this.config;

        //Common parameters
        const layout = {
            yaxis: {
                range: [this.plotMinimumYValue, this.plotMaximumYValue]
            },
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





        //======================================================================
        //Getting references
        // const divResults = document.getElementById('results');


        const content = document.getElementById('panelScenarioCombinedResilienceRegion');


        //Adding the legend to the DOM
        const legend = document.createElement("legend");
        legend.setAttribute("class", "legend");
        legend.innerHTML = "(Movable Flow at n-Frames) vs (Density Resilience Region)";

        //Adding a panel to place results
        const results = document.createElement("div");
        results.setAttribute("id", "scenarioCombinedResilienceRegion");
        results.setAttribute("class", "panelPerformance");

        //Arming the DOM
        content.append(legend);
        content.append(results);

        const container = document.getElementById('scenarioCombinedResilienceRegion');
        // this.drawScenarioCombinedResilienceRegion(container, resilienceTraces, attackTraces, layout, config);

        this.drawResultsResilienceRegionCombined(this.numberOfScenarios, container, layout, config);

    }





    /**
     * This method draws all flow results of the simulator
     * 
     */
    drawResultsResilienceRegionCombined(numberOfScenarios, container, layout, config) {



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
                let totalMovablesCrossedFinishLine = simulation.get(densities[j.toString()]).totalMovablesCrossedFinishLine;

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
         * This method draws the console highlighting the speed of each Movable.
         * 
         * It is very good to see how a particular Movable speed up and slow down
         * during the simulation.
         * 
         * This method drives all the speeds that happen in a frame.
         * 
         * e.g.
         * 
         *    0 . .  --0
         *    . 1 .  --1
         *    . . 2  --2
         *    . . 3  --3
         * 
         * 
         * It wil draw:
         * 
         *  4 +   
         *  3 +     *
         *  2 +   *
         *  1 + *   
         *  0 *-+-+-+-+-+-+--
         *      1 2 3 4 5  
         * 
         * @param {Map} frames 
         */
    drawCollapsibleHighlightMovable(frames) {

        //DOM operations
        const myPanel = document.getElementById("panelFramesHighlightMovable");

        const divPanelDark = document.createElement("div");
        divPanelDark.setAttribute("id", "panelDark");

        //Clear the panel
        myPanel.innerHTML = ""
        //Arming DOM
        myPanel.append(divPanelDark);

        //Console
        const myConsole = divPanelDark;

        //Cleans the buffer to write only relevant info about the frame
        let myBuffer = "";

        for (let [key, road] of frames.entries()) {


            const top = road.length;
            for (let i = 0; i < top; i++) {


                if ((road[i] !== null) && (typeof road[i] === 'object')) {

                    let myMovable = road[i];
                    let myColour = myMovable.colour;

                    if (myMovable.kind === "hacked") { 
                        myBuffer = myBuffer + "<span style='color: " + myColour + "'>" + "<u>" + myMovable.velocity + "</u>" +"</span>";
                    } else {
                        myBuffer = myBuffer + "<span style='color: " + myColour + "'>" + myMovable.velocity + "</span>";
                    }

                } else {

                    myBuffer = myBuffer + "<span style='color: black'>.</span>";

                }
            }

            myBuffer = myBuffer + "  -" + key + "\n";
        }

        myConsole.innerHTML = myBuffer.replace(/(\r\n|\n|\r)/gm, "<br>");

        //Scrolls to the last line
        myConsole.scrollTop = myConsole.scrollHeight


    }





    /**
     * This method draws the console higlighting the traffic speed.
     * 
     * It is very useful to see when the big traffic jams are formed
     * 
     * This method drives all the speeds that happen in a frame.
     * 
     * e.g.
     * 
     *    0 . .  --0
     *    . 1 .  --1
     *    . . 2  --2
     *    . . 3  --3
     * 
     * 
     * It wil draw:
     * 
     *  4 +   
     *  3 +     *
     *  2 +   *
     *  1 + *   
     *  0 *-+-+-+-+-+-+--
     *      1 2 3 4 5  
     * 
     * @param {Map} frames 
     */
    drawCollapsibleHighlightTraffic(frames) {

        // DOM operations
        const myPanel = document.getElementById("panelFramesHighlightTraffic");

        const divPanelDark = document.createElement("div");
        divPanelDark.setAttribute("id", "panelDark");

        //Clear the panel
        myPanel.innerHTML = ""
        //Arming DOM
        myPanel.append(divPanelDark);

        //Console
        const myConsole = divPanelDark;

        //Cleans the buffer to write only relevant info about the frame
        let myBuffer = "";





        for (let [key, road] of frames.entries()) {

            const top = road.length;
            for (let i = 0; i < top; i++) {

                if ((road[i] !== null) && (typeof road[i] === 'object')) {

                    let myMovable = road[i];
                    let myColour = "";

                    switch (myMovable.velocity) {
                        case 0:
                            myColour = "white";
                            break;
                        case 1:
                            myColour = "yellow";
                            break;
                        case 2:
                            myColour = "orange";
                            break;
                        case 3:
                            myColour = "green";
                            break;
                        case 4:
                            myColour = "blue";
                            break;
                        case 5:
                            myColour = "red";
                            break;
                    }

                    if (myMovable.kind === "hacked") { 
                        myBuffer = myBuffer + "<span style='color: " + myColour + "'>" + "<u>" + myMovable.velocity + "</u>" +"</span>";
                    } else {
                        myBuffer = myBuffer + "<span style='color: " + myColour + "'>" + myMovable.velocity + "</span>";
                    }




                } else {

                    myBuffer = myBuffer + "<span style='color: black'>.</span>";
                }
            }

            myBuffer = myBuffer + "  -" + key + "\n";
        }

        myConsole.innerHTML = myBuffer.replace(/(\r\n|\n|\r)/gm, "<br>");


        //Scrolls to the last line
        myConsole.scrollTop = myConsole.scrollHeight

    }





    /**
      * This method creates the resilience region structure that will be
      * dynamically updated later.
      */
    drawDynamicResilienceRegionInit() {

        const config = this.config;
        const container = this.container;


        const layout = {
            xaxis: {
                // autorange: true,
                range: [0, 5],
                rangeselector: {
                    buttons: [
                        {
                            count: 1,
                            label: '1m',
                            step: 'frame',
                            stepmode: 'backward'
                        },
                        {
                            count: 6,
                            label: '6m',
                            step: 'frame',
                            stepmode: 'backward'
                        },
                        { step: 'all' }
                    ]
                },
                rangeslider: { range: [0, 50] },
                type: 'integer'
            },
            yaxis: {

                // range: [0, 20]
                range: [this.plotMinimumYValue, this.plotMaximumYValue]
            },
            autosize: true,
            autoscale: false,
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





        //Create a new object trace to store results to be collected
        const myTraceMax = {
            x: new Array(),
            y: new Array(),
            mode: 'lines+markers',
            fill: 'tozero',
            line: {
                shape: 'spline'
            },
            type: 'scatter',
            name: "Max",
        };








        //Create a new object trace to store results to be collected
        const myTraceMin = {
            x: new Array(),
            y: new Array(),
            mode: 'lines+markers',
            fill: 'tonexty',
            line: {
                shape: 'spline'
            },
            type: 'scatter',
            name: "Min",
        };




        const myTrace = {
            //colorway: this.colorway,
            x: new Array(),
            y: new Array(),
            mode: 'lines+markers',
            line: {
                shape: 'spline'
            },
            type: 'scatter',
            name: 'Flow'

            // mode: 'markers',
            // mode:'lines',
            // boxmean: true,
            // boxpoints: 'Outliers',
            // boxpoints: 'all',
            // jitter: 0.3,
            // pointpos: -1.8,
            // marker: {
            //     size: 5
            // }
        };





        const myTraces = new Map();
        myTraces.set("0", myTraceMax);
        myTraces.set("1", myTraceMin)
        myTraces.set("2", myTrace)

        const data = [...myTraces.values()];

        Plotly.newPlot(container, data, layout, config);

    }





    /**
     * This method updates the current dynamic resilience region with new
     * values.
     * 
     * @param {float} currentPerformance 
     * @param {float} resilienceRegionMaxY 
     * @param {float} resilienceRegionMinY 
     * @param {int} currentFrame 
     * @param {float} density 
     */
    drawDynamicResilienceRegionUpdate(
        currentPerformance,
        resilienceRegionMaxY,
        resilienceRegionMinY,
        currentFrame,
        density) {

        const container = this.container;

        //This reads the position to be used by the density
        let i = this.x;

        const myTickvals = this.dynamicTickvals;
        const myTicktext = this.dynamicTicktext;

        myTickvals.push(i);
        myTicktext.push(i + " (f="+ currentFrame + "; d=" + density + ")");

        this.dynamicTickvals = myTickvals;
        this.dynamicTicktext = myTicktext;;





        //This is the section that actually performs the screen update
        Plotly.extendTraces(container, {
            x: [[i], [i], [i]],
            y: [[resilienceRegionMinY], [resilienceRegionMaxY], [currentPerformance]]
        }, [0, 1, 2])

        //Adjusting the visibility window
        //This code calculates the visible layout to show the last section draw.
        //This moves the scroll to the last position creating the illusion
        //of movement
        let update = {
            xaxis: {
                range: i > 5 ? [i - 5, i] : [0, 5],
                rangeslider: { range: [0, 50] },
                tickvals: myTickvals,
                ticktext: myTicktext
            }
        }


        //This instruction actually adjust the visibility window
        Plotly.relayout(container, update);


        //This saves the position for the next density to be drawn
        this.x = i + 1;

    }






    /**
      * This method drawas the animation panel.
      * This panel should be inside the collapsible
      */
    drawCollapsibleAnimation() {

        //Adding Animation panel
        const performanceAnimation = document.createElement("div");
        performanceAnimation.setAttribute("class", "panelPerformance");
        performanceAnimation.setAttribute("id", "performanceAnimation");


        // document.getElementById('animationCenter').appendChild(divPanelAnimation);
        document.getElementById('panelAnimation').appendChild(performanceAnimation);

    }





    /**
     * Produces the frames to animate in the correct format
     * @param {Array} frames
     * @returns {Array} frames 
     */
    createFramesToAnimate(frames) {

        //This stores the results
        const myFrames = [];

        for (let i = 0; i < frames.size; i++) {

            //Trying to get one single frame first

            const cells = frames.get(i.toString());

            const myIds = new Array();
            const myX = new Array();
            const myY = new Array();
            const myColours = new Array();


            // const mySymbols = new Array();
            const myWidth = new Array();


            let myMovable;

            for (let j = 0; j < cells.length; j++) {

                // if ((cells[i] !== undefined) && (cells[i].constructor === Movable)) {
                if (cells[j] !== null) {

                    myMovable = cells[j];
                    // console.log(myMovable);

                    myIds.push(myMovable.id);
                    myX.push(myMovable.x);
                    myY.push(1)// Always at the same height;
                    // myY.push(myMovable.velocity)// Kite animation;

                    myColours.push(myMovable.colour);
                    // mySymbols.push(myMovable.kind === "hacked" ? 'x' : 'square');
                    myWidth.push(myMovable.kind==="hacked" ? 3 : 0 );
                }
            }






            const myData = [{
                x: myX,
                y: myY,
                marker: {
                    size: 14,
                    color: myColours,
                    symbol: 'square',
                    // symbol: mySymbols,
                    line: { color: 'red', width: myWidth },

                    //TODO Delete this
                    // symbol:'triangle-right',
                    // line: myLines  
                    // line: { color: 'red', width: 6 }
                },
                ids: myIds,
                // type: 'scatter',
                mode: 'markers'
                // mode: 'line+markers'
            }];


            const myFrame = {
                data: myData,
                name: "Frame: " + i
            };

            myFrames.push(myFrame);

        }




        return myFrames;
    }





    /**
     * This method creates the region to place the animation of the movables
     * travelling through the road.
     * 
     * TODO Dynamic controls
     * TODO I would like to have a slider, forward and backaward
     */
    animationLoadPlayer(frames) {

        const config = this.config;
        const container = document.getElementById("performanceAnimation");
        const myFrames = this.createFramesToAnimate(frames);


        //Drawing the data


        // Creating the slider steps, one for each frame. The slider
        // executes a plotly.js API command (here, Plotly.animate).
        // we animate to one of the named frames
        // created in the above loop.
        // If all of a component's commands affect a single attribute, the component
        // will be bound to the plot and will automatically update to reflect changes.
        const sliderSteps = [];
        for (let i = 0; i < myFrames.length; i++) {

            sliderSteps.push({
                method: 'animate',
                label: i,
                //This name binds the slider to the play button
                args: [[myFrames[i].name], {
                    mode: 'immediate',
                    transition: { duration: 300 },
                    frame: { duration: 300, redraw: false },
                }]
            });
        }


        //Just the first frame is enough to calculate the whole section 
        const traces = myFrames[0].data;
        

        const layout = {
            //xaxis and yaxis are dynamically adjusted

            // hovermode: 'closest',

            // We'll use updatemenus (whose functionality includes menus as
            // well as buttons) to create a play button and a pause button.
            // The play button works by passing `null`, which indicates that
            // Plotly should animate all frames. The pause button works by
            // passing `[null]`, which indicates we'd like to interrupt any
            // currently running animations with a new list of frames. Here
            // The new list of frames is empty, so it halts the animation.
            updatemenus: [{
                x: 0,
                y: 0,
                yanchor: 'top',
                xanchor: 'left',
                showactive: false,
                direction: 'left',
                type: 'buttons',
                pad: { t: 87, r: 10 },
                buttons: [{
                    method: 'animate',
                    args: [null, {
                        mode: 'immediate',
                        fromcurrent: true,
                        transition: { duration: 300, easing: 'linear' },
                        frame: { duration: 300, redraw: false }
                    }],
                    label: 'Play'
                }, {
                    method: 'animate',
                    args: [[null], {
                        mode: 'immediate',
                        transition: { duration: 0 },
                        frame: { duration: 0, redraw: false }
                    }],
                    label: 'Pause'
                }]
            }],
            // Finally, adding the slider and use `pad` to position it
            // nicely next to the buttons.
            sliders: [{
                pad: { l: 130, t: 55 },
                currentvalue: {
                    visible: true,
                    prefix: 'Frame:',
                    xanchor: 'right',
                    font: { size: 12, color: '#666' }
                },
                steps: sliderSteps
            }]
        };






        //Places the player on the secreen
        Plotly.newPlot(container, {
            data: traces,
            layout: layout,
            frames: myFrames,
            config: config
        })
            .then(
                //Creating this plotly player returns a promise
                function () {
                    //Adjusting the size of the collapsible
                    const content = document.getElementById("contentAnimation");
                    content.style.maxHeight = content.scrollHeight + "px";
                })
            .catch(

                //! Catch is not working.
                //! When I stop the animation get an unhandled promise
                //! That should be captured here
                // function (error) {
                //     console.log(error);
                // }
                err => {
                    console.log(err);
                    console.log("Ooops!")
                    //Some UI updates notifying user about failure  
                }
            )
            .finally();





    }







    /**
     * This method drawas the animation panel.
     * This panel should be inside the collapsible
     */
    drawCollapsibleTransitionScenariosControl() {

        //Getting the container panel
        const container = document.getElementById('panelScenariosCombinedControl');

        //Add button   
        const myAddButton = document.createElement("BUTTON");
        myAddButton.innerHTML = "Add Scenario";
        myAddButton.setAttribute("id", "addScenario");
        myAddButton.setAttribute("class", "button");

        //Adding behaviour
        //I have to bind this into the function to be able to access the outer methods using this.
        myAddButton.addEventListener("click", this.addScenario.bind(this), false);

        //Adds the link
        container.appendChild(myAddButton);





        //Delete button
        let myDeleteButton = document.createElement("BUTTON");
        myDeleteButton.innerHTML = "Delete selected scenarios";
        myDeleteButton.setAttribute("id", "deleteScenario");
        myDeleteButton.disabled = true;


        //Adding behaviour
        myDeleteButton.addEventListener("click", this.deleteSelectedScenarios.bind(this), false);

        //Adds the link
        container.appendChild(myDeleteButton);



        //Adding a canvas
        const panelAddScenariosScrollArea = document.createElement("div");
        panelAddScenariosScrollArea.setAttribute("class", "panelAddScenariosScrollArea");
        panelAddScenariosScrollArea.setAttribute("id", "panelAddScenariosScrollArea");


        //Adding a row panel
        const panelRows = document.createElement("div");
        panelRows.setAttribute("class", "child");
        panelRows.setAttribute("id", "panelAddScenariosRows");



        container.appendChild(panelAddScenariosScrollArea);
        panelAddScenariosScrollArea.appendChild(panelRows);


        //Adding first row. Scenario 0
        this.addScenario();

    }




    //TODO Review if part or all of this method should be in the controller
    /**
     * This adds a scenario
     */
    addScenario() {
        const i = this.currentScenarioRow;
        
        const row = document.createElement("div");
        row.setAttribute("id", "row" + i);

        const container = document.getElementById('panelAddScenariosRows');
        container.appendChild(row);
        const myName = "transition";






        //==============================================================Checkbox
        //creating checkbox attribute
        const myCheckBox = document.createElement("input");
        myCheckBox.setAttribute("type", "checkbox");

        myCheckBox.setAttribute("id", myName + "Checkbox" + i);
        myCheckBox.setAttribute("class", "checkboxElement");
        myCheckBox.setAttribute("name", myName + "Checkbox");

        //It adds and event listener to enable and disable the delete button
        myCheckBox.addEventListener("change", this.enableDisableDeleteButton.bind(this), false);

        //Append the label to the separator
        row.appendChild(myCheckBox);









        //========================================================Label:On Frame
        let mySpanStartsOnFrame = document.createElement("span");
        mySpanStartsOnFrame.setAttribute("class", "label3");
        mySpanStartsOnFrame.innerHTML = "On Frame ";


        //Append the label to the separator
        row.appendChild(mySpanStartsOnFrame);


        let myInputFieldTransitionFrame = document.createElement("input");
        myInputFieldTransitionFrame.setAttribute("class", "input");
        myInputFieldTransitionFrame.setAttribute("type", "text");
        myInputFieldTransitionFrame.setAttribute("id", myName + "Frame" + i);


        //Append the label to the separator
        row.appendChild(myInputFieldTransitionFrame);

        //Increase row counter
        this.currentScenarioRow = this.currentScenarioRow + 1;

        //Update size of the collapsible
        const content = document.getElementById("contentScenariosCombinedControls");
        content.style.maxHeight = content.scrollHeight + "px";



        //========================================================Label:Scenario
        let mySpan = document.createElement("span");
        mySpan.setAttribute("class", "label3");
        mySpan.innerHTML = "Scenario ";


        //Append the label to the separator
        row.appendChild(mySpan);


        let myInputFieldTransitionScenario = document.createElement("input");
        myInputFieldTransitionScenario.setAttribute("class", "input");
        myInputFieldTransitionScenario.setAttribute("type", "text");
        myInputFieldTransitionScenario.setAttribute("id", myName + "Scenario" + i);


        //Append the label to the separator
        row.appendChild(myInputFieldTransitionScenario);
           
    }





    /**
     * This deletes a scenario
     */
    deleteSelectedScenarios() {

        const x = window.confirm("Are you sure you want to delete the selected scenarios?");

        if (x) {
            //Reference to checkbox
            const checkboxes = document.getElementsByClassName("checkboxElement");
            //const top = checkboxes.length;

            //Changing loop names
            for (let i = 0, top = checkboxes.length; i < top; i++) {

                if (checkboxes[i].checked) {

                    const checkbox = checkboxes[i];
                    let id = checkbox.id;


                    //+ is Unary plus (Convert String to integer)
                    id = +id.replace("transitionCheckbox", "");

                    //Removing element
                    document.getElementById("row" + id).remove();

                    //Adjusting the index and array, since after removing is
                    i--;
                    top--;
                }
            }
        }
    }







    /**
     * Enable/Disable the delete Scenarios button if something is selected
     */
    enableDisableDeleteButton() {

        //Reference to checkbox
        const checkboxes = document.getElementsByClassName("checkboxElement");

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
    }














 





}