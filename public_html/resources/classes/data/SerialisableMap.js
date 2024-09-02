/* 
 * David Sanchez
 * Newcastle University
 * 
 * 2024 June 30: Created
 * This object is a serialisable Map.
 * It was created based on this:
 * https://farzadyz.com/blog/simple-serializable-maps-and-sets-in-javascript
 * 
 * The idea is to have maps that can be serialised easily.
 * I use a lot of maps in the objects and Stringify cannot cope with them.
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
 * This class is a SerialisableMap
 * It has the same functionalities of a map plus an additional method 
 * to produce JSON
 */

class SerialisableMap extends Map {



    constructor(iterable) {
        super(iterable);

    }







    // ========================================================================== //
    // Public methods (Prototype methods)
    toJSON() {


        // return Object.fromEntries(this);

        return {
            dataType: 'SerialisableMap',
            value: Object.fromEntries(this)
        };


    }





}