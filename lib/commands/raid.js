const Rx = require('rx');

module.exports = {
  name: 'raid',
  description: 'Lets others know you are ready to raid.',

  args: [],

  configureCommand() {
    this.raidService = this.nix.getService('iron-family', 'RaidService');
  },

  run(context, response) {
    return Rx.Observable.of(context.message.member)
      .map((member) => this.raidService.playerReady(member))
      .flatMap(() =>
        Rx.Observable.if(
          () => this.raidService.raiders.length >= 6,
          this.respondFireteamReady(response),
          this.respondRaiderReady(response),
        ),
      );
  },

  respondRaiderReady(response) {
    return Rx.Observable.of('')
      .map(() => this.raidService.raiders)
      .flatMap((raiders) =>
        response.send({
          type: 'message',
          content:
            `A raider is ready! That makes ${raiders.length}:\n` +
            `${raiders.map((u) => `- ${u.displayName}`).join('\n')}\n\n` +
            `[Use \`!cancel\` to remove yourself.]`,
        }),
      );
  },

  respondFireteamReady(response) {
    return Rx.Observable.of('')
      .map(() => this.raidService.raiders)
      .flatMap((raiders) =>
        response.send({
          type: 'message',
          content:
            `That makes ${this.raidService.raiders.length}! A fireteam is ready to raid:\n` +
            `${raiders.map((user) => `- ${user}`).join('\n')}\n\n` +
            `[Use \`!start\` to let me know when you've started.]`,
        }),
      );
  },
};
