const Router                    = use('core/router');
const Errors                    = use('core/errors');

const getHandlersDefinitions    = require('./handlersDefinitions');

const controllersCollection = new Map();

class Controllers {

    static define (controller){
        if(!controller.path) {
            throw new Errors.Fatal(`Property 'path' is missing in controller`);
        }else if(controllersCollection.has(controller.path)){
            throw new Errors.Fatal(`Controller with path '${controller.path}' is already defined`);
        }else{
            controllersCollection.set(controller.path, getHandlersDefinitions(controller));
        }
        return Router.addRoutes(controllersCollection.get(controller.path));
    };

}

module.exports = Controllers;