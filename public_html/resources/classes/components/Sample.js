/**
 * This code defines a Sample class
 * 
 * This class is used to store the different scripts that has to be executed
 * to represent different scenarios of the simulation.
 * 
 * The idea is to store the name of the script, e.g. "samples1" and execute
 * the script when it is selected in a menu using callback functionality.
 * 
 */
class Sample {
    constructor(id, script) {
        this.id = id;
        this.script = script;
    }
}