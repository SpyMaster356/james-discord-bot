const Rx = require('rx');

module.exports = {
  name: 'unsub',
  description: 'Unsubscribe from raid notifications',

  args: [],

  configureCommand() {
    this.raidService = this.nix.getService('iron-family', 'RaidService');
  },

  run(context, response) {
    return Rx.Observable.of(context.message.member)
      .flatMap((member) => this.raidService.unsubscribeMember(member))
      .flatMap(() => this.respondUnsubscribed(response))
      .catch((error) => {
        return this.nix.handleError(error, [
          {name: 'Command', value: 'unsub'},
        ]);
      });
  },

  respondUnsubscribed(response) {
    return Rx.Observable.of('')
      .flatMap(() =>
        response.send({
          type: 'message',
          content: `No problem. I have removed you from the notification list.`,
        }),
      );
  },
};
