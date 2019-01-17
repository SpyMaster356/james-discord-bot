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
