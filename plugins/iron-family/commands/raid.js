const Rx = require('rx');

class PlayerOfflineError extends Error {
  constructor(props) {
    super(props);
    this.name = "PlayerOfflineError";
  }
}

module.exports = {
  name: 'raid',
  description: 'Lets others know you are ready to raid.',

  args: [],

  configureCommand() {
    this.raidService = this.nix.getService('iron-family', 'RaidService');
  },

  run(context, response) {
    return Rx.Observable.of(context.message.member)
      .flatMap((member) => this.checkPlayerOnline(member))
      .flatMap((member) => this.raidService.playerReady(member))
      .flatMap(() =>
        Rx.Observable.if(
          () => this.raidService.raiders.length >= 6,
          this.respondFireteamReady(response),
          this.respondRaiderReady(response),
        ),
      )
      .catch((error) => {
        if (error instanceof PlayerOfflineError) {
          return this.respondRaiderOffline(response);
        }

        return this.nix.handleError(error, [
          { name: "Command", value: "Raid" },
        ]);
      });
  },

  checkPlayerOnline(member) {
    return Rx.Observable.if(
      () => member.user.presence.status === "offline",
      Rx.Observable.throw(new PlayerOfflineError(`${member.user.tag} is offline.`)),
      Rx.Observable.of(member),
    )
  },

  respondRaiderOffline(response) {
    return response.send({
      type: 'message',
      content:
        `My apologies, but you're currently invisible in Discord. You'll need ` +
        `to be online before I can add you to the fireteam.`,
    })
  },

  respondRaiderReady(response) {
    return Rx.Observable.of('')
      .map(() => this.raidService.raiders)
      .flatMap((raiders) =>
        response.send({
          type: 'message',
          content:
            `A raider is ready! That makes ${raiders.length}:\n` +
            `${raiders.map((u) => `  - ${u.displayName}`).join('\n')}\n\n` +
            `*Use \`!cancel\` to remove yourself. I'll also automatically `+
            `remove you when you go offline.*\n` +
            `*You can also use \`!notify\` to get messaged when someone ` +
            `wants to raid.*`,
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
            `${raiders.map((user) => `  - ${user}`).join('\n')}\n` +
            `*Use \`!start\` to let me know when you've started.*`,
        }),
      );
  },
};
