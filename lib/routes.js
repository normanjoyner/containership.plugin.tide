var _ = require("lodash");
var middleware = require([__dirname, "middleware"].join("/"));
var handlers = require([__dirname, "..", "handlers"].join("/"));

// initialize handlers
exports.initialize = function(core){
    // api get jobs
    core.api.server.server.get("/:api_version/tide/jobs", handlers.v1.jobs.get);

    // api get job
    core.api.server.server.get("/:api_version/tide/jobs/:job", middleware.job_exists, handlers.v1.job.get);

    // api create application
    core.api.server.server.post("/:api_version/tide/jobs/:job", middleware.job_missing, handlers.v1.job.create);

    // api update application
    core.api.server.server.put("/:api_version/tide/jobs/:job", middleware.job_exists, handlers.v1.job.update);

    // api delete job
    core.api.server.server.delete("/:api_version/tide/jobs/:job", middleware.job_exists, handlers.v1.job.delete);
}
