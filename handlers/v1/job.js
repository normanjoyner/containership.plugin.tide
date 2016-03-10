var tide_scheduler = require([__dirname, "..", "..", "lib", "tide-scheduler"].join("/"));

module.exports = {

    get: function(req, res, next){
        res.status(200).json(tide_scheduler.jobs[req.params.job].serialize());
    },

    create: function(req, res, next){
        req.body.id = req.params.job;
        tide_scheduler.add_job(req.body, function(){
            res.status(201).json({
                id: req.params.job
            });
        });
    },

    update: function(req, res, next){
        tide_scheduler.update_job(req.params.job, req.body, function(err){
            if(err)
                res.sendStatus(err.code);
            else
                res.sendStatus(200);
        });
    },

    delete: function(req, res, next){
        tide_scheduler.remove_job(req.params.job, function(){
            res.sendStatus(204);
        });
    }

}
