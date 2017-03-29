'use strict';

const cli = require('./lib/cli');
const request = require('./lib/request');
const routes = require('./lib/routes');
const tide_scheduler = require('./lib/tide-scheduler');

const _ = require('lodash');
const ContainershipPlugin = require('containership.plugin');

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

            var commands = _.map(cli, function(configuration, command){
                configuration.name = command;
                return configuration;
            });

            return { commands: commands };
        }
    },

    runCLI: function() {
        request.config = this.get_config('cli');

        const commands = _.map(cli, function(configuration, command){
            configuration.name = command;
            return configuration;
        });

        return {
            commands: commands
        }
    },

    initialize: function(core){
        if(!core || !core.logger) {
            return module.exports.runCLI();
        }

        core.logger.register(APPLICATION_NAME);

        if(core.options.mode === 'leader') {
            return module.exports.runLeader(core);
        } else if(core.options.mode === 'follower') {
            return module.exports.runFollower(core);
        } else if(core.logger) {
            return core.loggers[APPLICATION_NAME].log('error', 'Invalid configuration found when initializing containership tide plugin!');
        }
    },

    reload: function(){
        server.exit();
    }
});
