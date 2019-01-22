const Rx = require('rx');

module.exports = {
  name: 'start',
  description: 'Start the raid',

  configureCommand() {
    this.raidService = this.nix.getService('iron-family', 'RaidService');
  },

  run(context, response) {
    return Rx.Observable.of('')
      .map(() => this.raidService.raidStart())
      .flatMap(() => this.respondRaidStart(response));
  },

  respondRaidStart(response) {
    return Rx.Observable.of('')
      .flatMap(() =>
        response.send({
          type: 'message',
          content: `Raid is go! Good luck!`,
        }),
      );
  },
};
