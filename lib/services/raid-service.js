const Rx = require('rx');
const Service = require('nix-core').Service;

class RaidService extends Service {
  constructor(nix) {
    super(nix);

    this._readyPlayers = new Map();
  }

  get raiders() {
    return Array.from(this._readyPlayers.values());
  }

  onNixListen() {
    this.updateGameName();

    this.nix.streams
      .presenceUpdate$
      .flatMap(([_, newMember]) => this.handlePresenceUpdate(newMember))
      .catch((error) => {
        return this.nix.handleError(error, [
          {name: "Service", value: "RaidService"},
          {name: "Event", value: "presenceUpdate$"},
        ]);
      })
      .subscribe();
  }

  handlePresenceUpdate(member) {
    return Rx.Observable.of('')
      .filter(() => member.user.presence.status === "offline")
      .do(() => this.nix.logger.debug(`[RaidService:PresenceUpdate] ${member.user.tag} has gone offline`))
      .map(() => this.playerCanceled(member));
  }

  updateGameName() {
    this.nix.discord.user.setPresence({
      game: {
        name: `${this.raiders.length} ${this.raiders.length === 1 ? 'Raider' : 'Raiders'} Ready [!raid]`,
      },
    });
  }

  playerReady(member) {
    this._readyPlayers.set(member.id, member);
    this.updateGameName();
  }

  playerCanceled(member) {
    this._readyPlayers.delete(member.id);
    this.updateGameName();
  }

  raidStart() {
    this._readyPlayers.clear();
    this.updateGameName();
  }
}

module.exports = RaidService;
