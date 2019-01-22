const Rx = require('rx');
const DiscordAPIError = require('discord.js').DiscordAPIError;

const Service = require('nix-core').Service;

const DataKeys = {
  UsersToNotify: "raids.UsersToNotify"
};

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
    return Rx.Observable.of('')
      .map(() => this._readyPlayers.set(member.id, member))
      .map(() => this.updateGameName())
      .flatMap(() => Rx.Observable.if(
        () => this.raiders.length === 1,
        this.notifyFireteamCreated(member.guild),
        Rx.Observable.of(''),
      ));
  }

  playerCanceled(member) {
    this._readyPlayers.delete(member.id);
    this.updateGameName();
  }

  raidStart() {
    this._readyPlayers.clear();
    this.updateGameName();
  }

  notifyFireteamCreated(guild) {
    return Rx.Observable.of('')
      .flatMap(() => this.getSubscribedMembers(guild))
      .flatMap((members) => {
        let raiders = this.raiders;
        return Rx.Observable.combineLatest(
          Rx.Observable.of(
            `${raiders[0].displayName} has started a new raid fireteam! ` +
            `Use \`!raid\` in the clan server to join them!\n\n` +
            `*Use \`!unsub\` from the clan server to stop these messages.*`
          ),
          Rx.Observable.from(members)
            .filter((member) => !this.raiders.some((r) => r.id === member.id)),
        )
      })
      .flatMap(([message, member]) => member.sendMessage(message))
      .catch((error) => {
        if (error instanceof DiscordAPIError) {
          this.nix.logger.warn(`[Raid:NotifyFireteamCreated] Ignored error ${error}`);
          return Rx.Observable.of('');
        }

        return Rx.Observable.throw(error);
      })
      .toArray();
  }

  getSubscribedMembers(guild) {
    return this.nix.getGuildData(guild, DataKeys.UsersToNotify)
      .flatMap((subscribedUsers) => Rx.Observable.from(Object.values(subscribedUsers)))
      .map((subscribedUser) => guild.members.get(subscribedUser.id))
      .filter(Boolean)
      .toArray();
  }

  subscribeMember(member) {
    return this.nix.getGuildData(member.guild, DataKeys.UsersToNotify)
      .map((subscribedUsers) => {
        subscribedUsers = {...subscribedUsers};
        subscribedUsers[member.id] = {
          id: member.id,
        };
        return subscribedUsers;
      })
      .flatMap((subscribedUsers) => this.nix.setGuildData(member.guild, DataKeys.UsersToNotify, subscribedUsers))
  }

  unsubscribeMember(member) {
    return this.nix.getGuildData(member.guild, DataKeys.UsersToNotify)
      .map((subscribedUsers) => {
        subscribedUsers = {...subscribedUsers};
        delete subscribedUsers[member.id];
        return subscribedUsers;
      })
      .flatMap((subscribedUsers) => this.nix.setGuildData(member.guild, DataKeys.UsersToNotify, subscribedUsers))
  }
}

RaidService.DataKeys = DataKeys;

module.exports = RaidService;
