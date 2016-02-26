var ContainershipPlugin = require("containership.plugin");
var tide_scheduler = require([__dirname, "lib", "tide-scheduler"].join("/"));
var routes = require([__dirname, "lib", "routes"].join("/"));

module.exports = new ContainershipPlugin({
    type: "core",

    initialize: function(core){
        if(core.options.mode == "leader"){
            // register tide logger
            core.logger.register("tide-scheduler");

            // initialize tide scheduler
            tide_scheduler.initialize(core);

            // initialize routes
            routes.initialize(core);
        }
    },

    reload: function(){
        server.exit();
    }
});
