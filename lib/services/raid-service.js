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
    this.updatePresence();
  }

  updatePresence() {
    this.nix.discord.user.setPresence({
      game: {
        name: `${this.raiders.length} ${this.raiders.length === 1 ? 'Raider' : 'Raiders'} Ready [!raid]`,
      },
    });
  }

  playerReady(member) {
    this._readyPlayers.set(member.id, member);
    this.updatePresence();
  }

  playerCanceled(member) {
    this._readyPlayers.delete(member.id);
    this.updatePresence();
  }

  raidStart() {
    this._readyPlayers.clear();
    this.updatePresence();
  }
}

module.exports = RaidService;
