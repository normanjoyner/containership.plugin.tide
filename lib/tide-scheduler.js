var fs = require("fs");
var async = require("async");
var _ = require("lodash");
var Job = require([__dirname, "job"].join("/"));

module.exports = {

    initialize: function(core){
        var self = this;
        this.core = core;
    },

    jobs: {},

    add_job: function(config, fn){
        var self = this;
        this.jobs[config.id] = new Job(config);
        this.core.loggers["tide-scheduler"].log("verbose", ["Added job:", config.id].join(" "));

        if(this.core.cluster.praetor.is_controlling_leader()){
            config.application.id = config.id;

            if(!_.has(config.application, "tags"))
                config.application.tags = {};

            if(!_.has(config.application.tags, "metadata"))
                config.application.tags.metadata = {};

            config.application.tags.metadata.ancestry = "containership.plugin";
            config.application.tags.metadata.plugin = "tide";

            // force no respawn on application containers
            config.application.respawn = false;

            this.core.applications.add(config.application, function(err){
                self.jobs[config.id].schedule(function(){
                    self.core.loggers["tide-scheduler"].log("verbose", ["Created tide application", config.application.id].join(" "));

                    self.core.applications.remove(config.application.id, function(err){
                        self.core.applications.add(config.application, function(err){
                            async.timesSeries(config.instances, function(index, fn){
                                self.core.applications.deploy_container(config.application.id, {}, fn);
                            }, function(){
                                var interval = setInterval(function(){
                                    self.core.cluster.myriad.persistence.keys([self.core.constants.myriad.CONTAINERS_PREFIX, config.application.id, "*"].join(self.core.constants.myriad.DELIMITER), function(err, containers){
                                        if(!err && containers.length == 0)
                                            clearInterval(interval);
                                    });
                                }, 15000);
                            });
                        });
                    });
                });
            });

            return fn();
        }
    },

    update_job: function(id, new_config, fn){
        var self = this;

        var existing_config = this.jobs[id].config;
        var config = _.merge(existing_config, new_config);
        this.remove_job(id, function(err){
            if(err && err.key != "ENOKEY"){
                return fn({
                    code: 400
                });
            }

            self.add_job(config, fn);
        });
    },

    remove_job: function(id, fn){
        var self = this;

        this.core.loggers["tide-scheduler"].log("verbose", ["Removed job:", id].join(" "));

        if(this.core.cluster.praetor.is_controlling_leader()){
            this.jobs[id].cancel();
            delete this.jobs[id];
        }

        this.core.applications.remove(id, fn);
    }

}
