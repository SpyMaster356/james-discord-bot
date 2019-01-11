const Rx = require('rx');

module.exports = {
  name: 'raiders',
  description: 'Display a list of raiders ready to go.',

  args: [],

  configureCommand() {
    this.raidService = this.nix.getService('iron-family', 'RaidService');
  },

  run(context, response) {
    return Rx.Observable.of('')
      .flatMap(() => Rx.Observable.if(
        () => this.raidService.raiders.length === 0,
        this.respondNoRaiders(response),
        this.respondRaidersList(response),
      ));
  },

  respondNoRaiders(response) {
    return Rx.Observable.of('')
      .flatMap(() =>
        response.send({
          type: 'message',
          content: `Looks like no one has signed up to raid yet. Use \`!raid\` to start a fireteam.`,
        }),
      );
  },

  respondRaidersList(response) {
    return Rx.Observable.of('')
      .map(() => this.raidService.raiders)
      .flatMap((raiders) =>
        response.send({
          type: 'message',
          content:
            `${raiders.length} ${raiders.length === 1 ? "raider is" : "raiders are"} ready:\n` +
            `${raiders.map((u) => `  - ${u.displayName}`).join('\n')}\n` +
            `*Use \`!raid\` to join in!*`,
        }),
      );
  },
};
