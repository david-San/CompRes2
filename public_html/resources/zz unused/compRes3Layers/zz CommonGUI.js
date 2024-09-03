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
 * 2024 Jul 07: update
 * Delete elements that are not neede.
 */




/**
 * 
 * This is the CommonGUI class. 
 * This class is used to have some standard procedures to handle the interface
 * that are used in many places.
 * 
 * TODO Try to have only one method to create the collapsibles.
 * TODO Evaluate if animated and non-animated are useful.
 * TODO It could be only one non-animated. After all, this is a simulator
 * 
 */





class GUI {

    /**
     * It receives on the constructor the Stage
     * 
     * @param {Stage} stage 
     */
    constructor() {





        // ========================================================================== //
        // Privileged attributes





        // ========================================================================== //
        // Private attributes
        // By convention





        // ========================================================================== //
        // Private methods






        // ========================================================================== //
        // Privileged methods





    }




    // ========================================================================== //
    // Public methods (Prototype methods)





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
     * 
     * 
     * This code creates the collapsible interface.
     * 
     * - The idea is to have sections in one page and once you click
     *   on a collapsible, it will show the relevant section.
     * 
     * - This is faster than showing all sections and allows to focus
     *   on particular things.
     *  
     * 
     *   /-----------\ 
     *   |Collapsible|
     *   |           --------------------
     *   | Collapsible  content for 0.5 |
     *   |-------------------------------
     * 
     * 
     *  Taken from: https://www.w3schools.com/howto/howto_js_collapsible.asp
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
        myDivCollapsiblePanelLegend.setAttribute("id", "legend"+contentID);
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
 * Create one single collapsible item and add it to the container
 * 
 * Structure:
 * 
 *    - Collapsible Button
 *    - Collapsible Content
 *        + Collapsible Panel Legend
 *        + Collapsible Panel
 * 
 * 
 * 
 * This code creates the collapsible interface.
 * 
 * - The idea is to have sections in one page and once you click
 *   on a collapsible, it will show the relevant section.
 * 
 * - This is faster than showing all sections and allows to focus
 *   on particular things.
 *  
 * 
 *   /-----------\ 
 *   |Collapsible|
 *   |           --------------------
 *   | Collapsible  content for 0.5 |
 *   |-------------------------------
 * 
 * 
 *  Taken from: https://www.w3schools.com/howto/howto_js_collapsible.asp
 * 
 * @param {DOM} container 
 * @param {String} contentID 
 * @param {String} panelName
 * @param {String} panelLabel
 * @param {String} panelLegend 
 */
    collapsiblesCreateOneNoAnimated(container, contentID, panelName, panelLabel, panelLegend) {


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



        //No animation
        // this.collapsibleAssignBehaviourNoAnimated(myCollapsibleButton);


        // myCollapsibleButton.addEventListener("click", this.collapsibleToggleHandlerNoAnimated );


    }







    /**
     * This method handles the behaviour of the collapsibles.
     * Toggling on and off.
     * It is important that the method is defined because, if it is assigned
     * twice to a collapsible, it will not fire the event twice.
     */
    collapsibleToggleHandler() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {

            content.style.maxHeight = null;
            // realTime.SetFlagNotToDrawCollapsibleFrames();

        } else {

            // TODO Remove unused children[0]
            //Determining the collapsible content area name
            // const myDiv = content.children[0];


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
                realTime.LoadPlayer();

                //The collapsible size update is performed by the loadPlayer

            } else {

                //Update size of the collapsible
                content.style.maxHeight = content.scrollHeight + "px";

            };
        }
    };








    /**
     * Assigns behaviour to all collapsibles
     * 
     * This is the method that has to be modified to assign behaviours when
     * the collapsible is shown.
     * 
     * This method is called at the begining and when samples are loaded.
     * However, registering event listeners many times could creates issues
     * handling events.
     * In this version of Javascript, seems it is not possible to detect if 
     * an object has an event listener already assigned.
     * To avoid calling two or more event handler for one event, (because the
     * code to assign event handler is run more than once, one for the init and
     * one for loading of samples)
     * the handling function has to be defined outside, so, it has a unique definition.
     * The addEventListener, discards the extra event handler if 
     * the function is the same. 
     * It will not registered the event listener twice, if it is the same. 
     * 
     * https://stackoverflow.com/questions/26146108/addeventlistener-firing-multiple-times-for-the-same-handle-when-passing-in-argum
     * 
     */
    collapsiblesAssignBehaviour() {

      
        //Assign behaviour
        const myCollapsible = document.getElementsByClassName("collapsible");
        const topCollapsible = myCollapsible.length;

        for (let i = 0; i < topCollapsible; i++) {

            //See note.
            myCollapsible[i].addEventListener("click", this.collapsibleToggleHandler);
        }
    }





    /**
     * Assigns behaviour to a collapsible.
     * 
     * This method does not animate the collapsible.
     * Animation is very slow when there are many graphs.
     * So, it looks very heavy with animations
     * 
     */
    collapsibleAssignBehaviourNoAnimated() {

          //Assign behaviour
          const myCollapsible = document.getElementsByClassName("collapsible");
          const topCollapsible = myCollapsible.length;
  
          for (let i = 0; i < topCollapsible; i++) {
  
              //See note.
              myCollapsible[i].addEventListener("click", this.collapsibleToggleHandlerNoAnimated);
          }

    }
    



































collapsibleToggleHandlerNoAnimated() {
    
     /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.toggle("active");
    
    var content = this.nextElementSibling;
    if (content.style.maxHeight) {

        content.style.maxHeight = null;

    } else {



        // // Animated
        // let allHeights = 0;
        // let contents = document.getElementsByClassName("content");

        // for (let j = 0; j < contents.length; j++) {
        //     var h = document.getElementsByClassName("content")[j].scrollHeight;
        //     allHeights += h;
        // }
        // content.style.maxHeight = content.scrollHeight + allHeights + "px";

        //No animation
        content.style.maxHeight = 'max-content';

    };
}




}