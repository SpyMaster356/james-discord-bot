const Rx = require('rx');

module.exports = {
  name: 'cancel',
  description: 'Removes you from the Fireteam for the raid.',

  configureCommand() {
    this.raidService = this.nix.getService('iron-family', 'RaidService');
  },

  run(context, response) {
    return Rx.Observable.of(context.message.member)
      .map((member) => this.raidService.playerCanceled(member))
      .flatMap(() => this.respondRaiderRemoved(response));
  },

  respondRaiderRemoved(response) {
    return Rx.Observable.of('')
      .flatMap(() =>
        response.send({
          type: 'message',
          content:
            `Oh, Ok. I've removed you from the fireteam.`,
        }),
      );
  },
};
