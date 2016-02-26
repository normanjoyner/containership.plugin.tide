var _ = require("lodash");
var tide_scheduler = require([__dirname, "tide-scheduler"].join("/"));

module.exports = {

    job_exists: function(req, res, next){
        if(_.has(tide_scheduler.jobs, req.params.job))
            return next();

        res.sendStatus(404);
    },

    job_missing: function(req, res, next){
        if(!_.has(tide_scheduler.jobs, req.params.job))
            return next();

        res.sendStatus(404);
    }

}
