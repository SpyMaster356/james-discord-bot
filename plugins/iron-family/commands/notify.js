const Rx = require('rx');

module.exports = {
  name: 'notify',
  description: 'Subscribe to be notified when a new raid fireteam has been created.',

  args: [],

  configureCommand() {
    this.raidService = this.nix.getService('iron-family', 'RaidService');
  },

  run(context, response) {
    return Rx.Observable.of(context.message.member)
      .flatMap((member) => this.raidService.subscribeMember(member))
      .flatMap(() => this.respondSubscribed(response))
      .catch((error) => {
        return this.nix.handleError(error, [
          {name: 'Command', value: 'notify'},
        ]);
      });
  },

  respondSubscribed(response) {
    return Rx.Observable.of('')
      .flatMap(() =>
        response.send({
          type: 'message',
          content:
            `I'll let you know when a new raid fireteam is created.\n` +
            `*Use \`!unsub\` later to stop the notifications.*`,
        }),
      );
  },
};
