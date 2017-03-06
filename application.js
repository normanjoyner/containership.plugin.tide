'use strict';

const cli = require('./lib/cli');
const request = require('./lib/request');
const routes = require('./lib/routes');
const tide_scheduler = require('./lib/tide-scheduler');

const _ = require('lodash');
const ContainershipPlugin = require('containership.plugin');
const nomnom = require('nomnom');

const APPLICATION_NAME = 'tide-scheduler';

module.exports = new ContainershipPlugin({
    type: ['core', 'cli'],
    name: 'tide',

    runFollower: function(core) {
        core.loggers[APPLICATION_NAME].log('verbose', `${APPLICATION_NAME} does not run on follower nodes.`);
    },

    runLeader: function(core) {
        if(_.has(core, 'logger')){
            // initialize tide scheduler
            tide_scheduler.initialize(core);

            // initialize routes
            routes.initialize(core);
        } else {
            request.config = this.get_config('cli');

            var commands = _.map(cli, function(configuration, command){
                configuration.name = command;
                return configuration;
            });

            return { commands: commands };
        }
    },

    initialize: function(core){
        if(_.has(core, 'logger')){
            // register tide logger
            core.logger.register(APPLICATION_NAME);
        }


        if(core.options.mode === 'leader'){
            return module.exports.runLeader(core);
        }

        return module.exports.runFollower(core);
    },

    reload: function(){
        server.exit();
    }
});
