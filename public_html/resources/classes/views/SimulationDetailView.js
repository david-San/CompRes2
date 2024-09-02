/** 
 * David Sanchez
 * Newcastle University
 * 
 * 2022 June 11: Created
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
 * This class is used to show results of a particular simulation
 */
class SimulationDetailView {


    /**
     * 
     */
    constructor() {


        // ========================================================================== //
        // Privileged attributes

        let _sharedObject = window.opener._sharedObject;

        this.id = _sharedObject.simulationDetailId;
        this.simulationId = _sharedObject.simulationId;
        this.scenario = _sharedObject.scenarioId;

        this.simulations = _sharedObject.databank.scenarios.get(this.scenario).simulation;

        this.simulation = this.simulations.get(this.id);
        this.densities = Array.from(this.simulation.keys());

        //This is the configuration for exporting plot drawings
        this.config = _sharedObject.config;

        this.colorway = ['#1e90ff', '#b22222', '#6f4d96', '#3d3b72', '#182844'];



        // ========================================================================== //
        // Private attributes





        // ========================================================================== //
        // Private methods





        // ========================================================================== //
        // Privileged methods





        //Init the visualiaser simulation

        this.init();
        this.drawResultsFlow();
        this.createCollapsibles();
        this.drawCollapsibles();
        this.drawResultsSpeed();
    }





    // ========================================================================== //
    // Public methods (Prototype methods)




    /**
     * This method deletes the interface
     */
    init() {

        document.title = "Simulation " + this.simulationId + ". Scenario " + this.scenario + ". Simulation Detail " + this.id;

        //Setting a title inside the page
        document.getElementById("simulationTitle").innerHTML = "Simulation " + this.simulationId + ". Scenario " + this.scenario + ". Simulation Detail " + this.id;

        //It attaches an event handler for the "select sample" menu
        const myCollapsibles = document.getElementById('collapsibles');
        if (myCollapsibles != null) {
            myCollapsibles.textContent = '';
        }
    }





    /**
     * This code creates te collapsible interface.
     * 
     * - The idea is to have all densities into one page and once you click
     *   on a collapsible, it will show the relevant data.
     *  
     * - Densities are passed inside an array.
     *   e.g. [0.1,0.2,0.3,0.4,0.5]
     *   and it will draw an interface with colapsible items
     * 
     *   /---\ /---\ /---\ /---\ /---\
     *   |0.1|
     *   |0.2| 
     *   |0.3| 
     *   |0.4| 
     *   |0.5|
     *   |    ---------------------------
     *   | Collapsible  content for 0.5 |
     *   |-------------------------------
     * 
     * - Each of the collapsible content has added to the name the density
     *   so it is easier to identify.
     *   e.g.
     *   nashTraffic0.2
     *   nashMovable0.2
     *   panelPerformance0.2
     *   panelPerformanceAverage0.2
     * 
     *   So, each one can be selected when updating the interface.  
     * 
     *  Taken from: https://www.w3schools.com/howto/howto_js_collapsible.asp
     *
     * 
     * @param {Integer} id of the simulation iteration
     */
    createCollapsibles() {

        // const simulations = this.simulations;
        const densities = this.densities;
        const topDensities = densities.length;

        //Create HTML code dynamically
        for (let i = 0; i < topDensities; i++) {

            //This creates the collapsible buttons
            let myButton = document.createElement("button");
            myButton.innerHTML = densities[i];
            myButton.setAttribute("type", "button");
            myButton.setAttribute("class", "collapsible");



            //This creates the contents of each collapsible
            let myDivCollapsible = document.createElement("div");
            myDivCollapsible.setAttribute("class", "content");



            //This creates the contents of each collapsible
            //Panel Combined
            let divPanelCombined = document.createElement("div");
            divPanelCombined.setAttribute("id", "panelCombined");



            //Panel left
            let divPanelLeft = document.createElement("div");
            divPanelLeft.setAttribute("id", "panelLeft");
            let divPanelLeftLegend = document.createElement("legend");
            divPanelLeftLegend.setAttribute("class", "legend");
            divPanelLeftLegend.innerHTML = "Congestion Highlight";
            let divPanelDarkLeft = document.createElement("div");
            divPanelDarkLeft.setAttribute("id", "panelDark");
            let pCongestionHiglight = document.createElement("p");
            pCongestionHiglight.setAttribute("id", "congestionHighlight" + densities[i]);



            //Panel right
            let divPanelRight = document.createElement("div");
            divPanelRight.setAttribute("id", "panelRight");
            let divPanelRightLegend = document.createElement("legend");
            divPanelRightLegend.setAttribute("class", "legend");
            divPanelRightLegend.innerHTML = "Movable Highlight";
            let divPanelDarkRight = document.createElement("div");
            divPanelDarkRight.setAttribute("id", "panelDark");
            let pMovableHighlight = document.createElement("p");
            pMovableHighlight.setAttribute("id", "movableHighlight" + densities[i]);



            //Panel center
            let divPanelCenter = document.createElement("div");
            // divPanelCenter.setAttribute("id", "panelCenter");
            divPanelCenter.setAttribute("class", "panelCenter");

            //Panel Performance
            let divPanelPerformanceLegend = document.createElement("legend");
            divPanelPerformanceLegend.innerHTML = "Performance";
            let divPanelPerformance = document.createElement("div");
            divPanelPerformance.setAttribute("class", "panelPerformance");
            divPanelPerformance.setAttribute("id", "panelPerformance" + densities[i]);



            //Panel Speed
            let divPanelSpeedLegend = document.createElement("legend");
            divPanelSpeedLegend.setAttribute("class", "legend");
            divPanelSpeedLegend.innerHTML = "Speed of each movable";
            let divPanelSpeed = document.createElement("div");
            divPanelSpeed.setAttribute("class", "panelSpeed");
            divPanelSpeed.setAttribute("id", "panelSpeed" + densities[i]);


            //Panel Statistics
            let divPanelStatisticsLegend = document.createElement("legend");
            divPanelStatisticsLegend.setAttribute("class", "legend");
            divPanelStatisticsLegend.innerHTML = "Statistics";
            let divPanelStatistics = document.createElement("div");
            divPanelStatistics.setAttribute("class", "panelPerformance");
            divPanelStatistics.setAttribute("id", "panelStatistics" + densities[i]);


            //Arming the DOM

            //Panel left
            divPanelCombined.append(divPanelLeft);
            divPanelLeft.append(divPanelLeftLegend);
            divPanelLeft.append(divPanelDarkLeft);
            divPanelDarkLeft.append(pCongestionHiglight);

            //Panel right
            divPanelCombined.append(divPanelRight);
            divPanelRight.append(divPanelRightLegend);
            divPanelRight.append(divPanelDarkRight);
            divPanelDarkRight.append(pMovableHighlight);

            //Panel center
            divPanelCenter.append(divPanelPerformanceLegend);
            divPanelCenter.append(divPanelPerformance);
            divPanelCenter.append(divPanelSpeedLegend);
            divPanelCenter.append(divPanelSpeed);
            divPanelCenter.append(divPanelStatisticsLegend);
            divPanelCenter.append(divPanelStatistics);

            //Final arming
            myDivCollapsible.append(divPanelCombined);
            myDivCollapsible.append(divPanelCenter);

            //Adds the button
            document.getElementById("collapsibles").append(myButton);

            //Adds the content
            document.getElementById("collapsibles").append(myDivCollapsible);
        }






        //Assign behaviour
        const myCollapsible = document.getElementsByClassName("collapsible");
        const topCollapsible = myCollapsible.length;

        for (let i = 0; i < topCollapsible; i++) {

            myCollapsible[i].addEventListener("click", function () {
                this.classList.toggle("active");
                var content = this.nextElementSibling;
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            });
        }
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
     * @param {Integer} density 
     */
    drawCollapsibleHighlightMovable(density, storage) {

        //Cleans the buffer to write only relevant info about the frame
        let myBuffer = "";

        //It adds the policy evaluation  to the console panel

        const myConsoleOutput = "movableHighlight" + density;
        const myConsole = document.getElementById(myConsoleOutput);


        for (let [key, road] of storage.entries()) {


            const top = road.length;
            for (let i = 0; i < top; i++) {


                if ((road[i] !== null) && (typeof road[i] === 'object')) {

                    let myMovable = road[i];
                    let myColour = myMovable.colour;

                    myBuffer = myBuffer + "<span style='color: " + myColour + "'>" + myMovable.velocity + "</span>";

                } else {

                    myBuffer = myBuffer + "<span style='color: black'>.</span>";

                }
            }

            myBuffer = myBuffer + "  -" + key + "\n";
        }

        myConsole.innerHTML = myBuffer.replace(/(\r\n|\n|\r)/gm, "<br>");
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
     * @param {Integer} density 
     */
    drawCollapsibleHighlightCongestion(density, storage) {


        //Cleans the buffer to write only relevant info about the frame
        let myBuffer = "";

        //It adds the policy evaluation  to the console panel
        const myConsole = document.getElementById("congestionHighlight" + density);



        for (let [key, road] of storage.entries()) {

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

                    myBuffer = myBuffer + "<span style='color: " + myColour + "'>" + myMovable.velocity + "</span>";

                } else {

                    myBuffer = myBuffer + "<span style='color: black'>.</span>";
                }
            }

            myBuffer = myBuffer + "  -" + key + "\n";
        }

        myConsole.innerHTML = myBuffer.replace(/(\r\n|\n|\r)/gm, "<br>");
    }







    /**
     * This method drives box plot created with the speed of the vehiles.
     * 
     * @param {*} density 
     * @param {*} storage 
     * @param {*} initialFramesToDiscard 
     * @param {*} config 
     */
    drawCollapsiblePerformance(density, storage, initialFramesToDiscard, config) {

        const framesNumber = storage.size;

        // let performanceLowLimit = this.performanceLowLimit;
        // let performanceHighLimit = this.performanceHighLimit;

        const myX = new Array();
        const myY = new Array();

        const myAverageX = new Array();
        const myAverageY = new Array();

        for (let i = initialFramesToDiscard; i < framesNumber; i++) {


            let road = storage.get(i.toString());
            let totalSpeedOfAllMovables = 0;
            let totalNumberOfMovables = 0;

            for (let j = 0; j < road.length; j++) {

                if ((road[j] !== null) && (typeof road[j] === 'object')) {
                    let myMovable = road[j];

                    //Creating dataset for box plot
                    myX.push(i);
                    myY.push(myMovable.velocity);

                    //Creating dataset for average plot
                    totalSpeedOfAllMovables = totalSpeedOfAllMovables + myMovable.velocity;
                    totalNumberOfMovables = totalNumberOfMovables + 1;
                }
            }



            //Creating dataset for average plot
            let averageSpeed = totalSpeedOfAllMovables / totalNumberOfMovables;

            myAverageX.push(i);
            myAverageY.push(averageSpeed);



        }

        const container = document.getElementById('panelPerformance' + density);

        const trace1 = {
            x: myX,
            y: myY,
            type: 'box',
            name: 'Velocity',
            boxmean: true
            // mode: 'markers',
            // boxpoints: 'Outliers',
            // boxpoints: 'all',
            // jitter: 1,
            // pointpos: -1.8,
            // marker: {
            //     size: 5
            // }
        };


        const trace2 = {
            x: myAverageX,
            y: myAverageY,
            mode: 'lines+markers',
            name: 'Mean'
            // type: 'scatter',
            // mode: 'lines',
            // marker: {
            //     size: 6
            // }
        };

        const layout = {
            colorway: this.colorway,
            // colorway: ['#1e90ff', '#b22222', '#6f4d96', '#3d3b72', '#182844'],
            autosize: true,
            legend: {
                orientation: "h"
            }
            // xaxis: {
            //     range: [initialFramesToDiscard, framesNumber]
            // },
            // yaxis: {
            //     range: [-.5, 5.5]
            // },
            // colorway : ['#f3cec9', '#e7a4b6', '#cd7eaf', '#a262a9', '#6f4d96', '#3d3b72', '#182844'],
            // title: 'Velocity/Frame'
        };





        const data = [trace1, trace2];
        Plotly.newPlot(container, data, layout, config);
    }





    /**
     * This method drives each Movable and its speed that happen in all frames.
     * 
     * e.g.
     * 
     * Movable A:
     * 
     *    0 . .  --0
     *    . 1 .  --1
     *    . . 2  --2
     *    . . 3  --3
     * 
     * Movable B:
     * 
     *    . 1 .  --0
     *    . 2 .  --1
     *    . . 3  --2
     *    . . 4  --3
     * 
     * It wil draw:
     * 
     *  4    
     *  3     A B
     *  2   A B
     *  1 A B   
     *  0 *-+-+-+-+-+-+--
     *      1 2 3 4 5  
     */
    drawCollapsibleSpeed(density, storage, initialFramesToDiscard, config) {

        const framesNumber = storage.size;

        const traces = new Map();
        const myColorway = new Array();

        for (let i = initialFramesToDiscard; i < framesNumber; i++) {


            let road = storage.get(i.toString());

            for (let j = 0; j < road.length; j++) {

                if ((road[j] !== null) && (typeof road[j] === 'object')) {
                    let myMovable = road[j];

                    if (traces.has(myMovable.id)) {
                        //Getting the trace if already exists
                        let myTrace = traces.get(myMovable.id);

                        //Creating dataset for line plot
                        myTrace.x.push(i);
                        myTrace.y.push(myMovable.velocity);

                    } else {

                        let myTrace = {
                            x: new Array(),
                            y: new Array(),
                            mode: 'lines+markers',
                            // line: {
                            //     shape: 'spline'
                            // },
                        };

                        //Creating dataset for line plot
                        myTrace.x.push(i);
                        myTrace.y.push(myMovable.velocity);
                        myColorway.push(myMovable.colour);

                        traces.set(myMovable.id, myTrace);
                    }
                }
            }
        }

        const container = document.getElementById('panelSpeed' + density);

        const layout = {
            colorway: myColorway,
            autosize: true,
            legend: {
                orientation: "h"
            }
            // xaxis: {
            //     range: [initialFramesToDiscard, framesNumber]
            // },
            // yaxis: {
            //     range: [-.5, 5.5]
            // },
            // title: 'Movable Velocity/Frame'
        };



        const data = [...traces.values()];

        Plotly.newPlot(container, data, layout, config);
    }





    /**
     * This method draws the statistics of each density
     * on its respective collapsible panel.
     * 
     * @param {Integer} density 
     */
    drawCollapsibleStatistics(density, simulation) {

        //Cleans the buffer to write only relevant info about the frame
        let myBuffer = "";

        //It adds the policy evaluation  to the console panel
        const myConsole = document.getElementById("panelStatistics" + density);

        myBuffer =
            "Number of Cells: " + simulation.numberOfCells + "\n" +
            "Density: " + simulation.density + "\n" +


            "Number of Movables: " + simulation.numberOfMovables + "\n" +
            "Number of Frames: " + simulation.numberOfFrames + "\n" +
            "Total Movables Crossed Finish Line: " + simulation.totalMovablesCrossedFinishLine + "\n" +
            "Total Movables Crossed Finish Line per Frame: " + simulation.totalMovablesCrossedFinishLinePerFrame + "\n" +
            "Initial Frames to Discard: " + simulation.initialFramesToDiscard + "\n\n" +


            "Speed average: " + simulation.averageSpeed + "\n" +
            "Speed Max Boundary for Movable: " + simulation.speedHighLimit + "\n" +
            "Speed Min Boundary for Movable: " + simulation.speedLowLimit + "\n" +
            "Resilience Speed Cumulative Index relative to Max Speed (Should be <1): " + simulation.resilienceSpeedTotalMax + "\n" +
            "Resilience Speed Cumulative Index relative to Min Speed (Should be >1): " + simulation.resilienceSpeedTotalMin + "\n\n" +


            "Flow for this density: " + simulation.totalMovablesCrossedFinishLine + "\n" +
            "Flow Max Boundary Region for this density: " + simulation.resilienceFlowBoundaryRegionMax + "\n" +
            "Flow Min Boundary Region for this density: " + simulation.resilienceFlowBoundaryRegionMin + "\n" +
            "Resilience Flow Cumulative Index relative to Max Flow (Should be <1): " + simulation.resilienceFlowIndexMax + "\n" +
            "Resilience Flow Cumulative Index relative to Min Flow (Should be >1): " + simulation.resilienceFlowIndexMin + "\n";



        myConsole.innerHTML = myBuffer.replace(/(\r\n|\n|\r)/gm, "<br>");
    }





    /**
     * This method draws all consoles
     */
    drawCollapsibles() {

        const densities = this.densities;
        const simulations = this.simulation;
        const config = this.config;

        const initialFramesToDiscard = simulations.get(densities["0"]).initialFramesToDiscard;

        //Common parameters
        const layout = {
            colorway: this.colorway,
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




        for (let i = 0; i < densities.length; i++) {

            let myDensity = densities[i];
            let mySimulations = simulations.get(myDensity).frames;

            this.drawCollapsibleHighlightCongestion(myDensity, mySimulations);
            this.drawCollapsibleHighlightMovable(myDensity, mySimulations);
            this.drawCollapsiblePerformance(myDensity, mySimulations, initialFramesToDiscard, config);
            this.drawCollapsibleSpeed(myDensity, mySimulations, initialFramesToDiscard, config);
            this.drawCollapsibleStatistics(myDensity, simulations.get(myDensity));
        }
    }





    /**
     * This method draws all Speed result of the simulation
     */
    drawResultsSpeed() {

        const simulations = this.simulation;
        const config = this.config;
        // const xNumber = simulations.size;


        const myTotalAverageX = new Array();
        const myTotalAverageY = new Array();

        //Adding the legend to the DOM
        const legendResults = document.createElement("legend");
        legendResults.setAttribute("class", "legend");
        legendResults.innerHTML = "Results: (Movable Speed)/Density";

        //Adding a panel to place results
        const divPerformanceResults = document.createElement("div");
        divPerformanceResults.setAttribute("id", "performanceResults");
        divPerformanceResults.setAttribute("class", "panelPerformance");

        //Arming the DOM
        const divResults = document.getElementById('Results');
        divResults.append(legendResults);
        divResults.append(divPerformanceResults);



        //Traversing the map to the get all densities. 
        //Densities are used as key. Simulation are values
        for (const [density, simulation] of simulations) {

            //Traverse the Map (frame is key, road is value) to get all speeds
            //Order is not guaranteed, but it is not important

            let myInitialFramesToDiscard = simulation.initialFramesToDiscard;

            //The code has to be constructed this way so it is possible to avoid the
            //first myInitialFramesToDiscard. Enumerators do not allow to 
            //jump myInitialFramesToDiscard
            let frames = Array.from(simulation.frames.keys());
            let top = frames.length;
            // console.log(frames);
            // const [frame, road] of simulation.frames

            for (let i = myInitialFramesToDiscard; i < top; i++) {

                let road = simulation.frames.get(frames[i.toString()]);

                for (let i = 0; i < road.length; i++) {

                    if ((road[i] !== null) && (typeof road[i] === 'object')) {

                        let myMovable = road[i];

                        //Creating dataset for total box plot
                        myTotalAverageX.push(density);
                        myTotalAverageY.push(myMovable.velocity);
                    }
                }
            }


            const container = document.getElementById('performanceResults');

            const trace = {
                colorway: this.colorway,
                x: myTotalAverageX,
                y: myTotalAverageY,
                type: 'box',
                name: 'Velocity',
                boxmean: true
                // mode: 'markers',
                // boxpoints: 'Outliers',
                // boxpoints: 'all',
                // jitter: 0.3,
                // pointpos: -1.8,
                // marker: {
                //     size: 5
                // }
            };


            //Takes all defaults for layout
            const layout = {
                // xaxis: {
                //     range: [0, xNumber]
                // },
                // yaxis: {
                //     range: [-.5, 5.5]
                // },
                // colorway: ['#1e90ff', '#b22222', '#6f4d96', '#3d3b72', '#182844']
                // autosize:true
                // colorway : ['#f3cec9', '#e7a4b6', '#cd7eaf', '#a262a9', '#6f4d96', '#3d3b72', '#182844'],
                // title: 'Velocity/Frame'
            };




            const data = [trace];
            Plotly.newPlot(container, data, layout, config);
        }
    }





    /**
     * This method draws all flow results of the simulator
     * 
     */
    drawResultsFlow() {

        const simulations = this.simulation;
        const config = this.config;

        const densities = this.densities;

        const myX = densities;
        const myY = new Array();

        //Adding the legend to the DOM
        const legendFlow = document.createElement("legend");
        legendFlow.setAttribute("class", "legend");
        legendFlow.innerHTML = "Results: (Movable Flow)/Density";

        //Adding a panel to place results
        const divFlowResults = document.createElement("div");
        divFlowResults.setAttribute("id", "performanceFlowResults");
        divFlowResults.setAttribute("class", "panelPerformance");

        //Arming the DOM
        const divResults = document.getElementById('Results');
        divResults.append(legendFlow);
        divResults.append(divFlowResults);

        //Traversing the map to the get all densities. 
        //Densities are used as key. Simulation are values

        const top = simulations.size;

        for (let i = 0; i < top; i++) {

            let totalMovablesCrossedFinishLine = simulations.get(densities[i.toString()]).totalMovablesCrossedFinishLine;
  
            myY.push(totalMovablesCrossedFinishLine);
        }


        const container = document.getElementById('performanceFlowResults');

        const trace = {
            colorway: this.colorway,
            x: myX,
            y: myY,
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


        //Takes all defaults for layout
        const layout = {
            // xaxis: {
            //     range: [0, xNumber]
            // },
            // yaxis: {
            //     range: [-.5, Math.max(...myY)]
            // },
            //   title: 'Download Chart as SVG instead of PNG',
            // showlegend: false,
            // autotick: false,
            // ticks: 'outside',
            // colorway: ['#1e90ff', '#b22222', '#6f4d96', '#3d3b72', '#182844']
            // autosize:true
            // colorway : ['#f3cec9', '#e7a4b6', '#cd7eaf', '#a262a9', '#6f4d96', '#3d3b72', '#182844'],
            // title: 'Velocity/Frame'
        };



        const data = [trace];
        Plotly.newPlot(container, data, layout, config);


    }





}









var simulationDetailView = new SimulationDetailView();