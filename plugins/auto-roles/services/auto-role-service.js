const Rx = require('rx');
const Service = require('nix-core').Service;

const DataKeys = require('../data-keys');
const {
  RoleAlreadyAddedError,
  RoleNotAddedError,
} = require('../errors');

class AutoRoleService extends Service {
  getJoinRoles(guild) {
    return Rx.Observable.of('')
      .flatMap(() => this.nix.getGuildData(guild.id, DataKeys.JoinRoles))
      .flatMap((roleIds) => Rx.Observable.from(roleIds))
      .map((roleId) => guild.roles.get(roleId))
      .filter((role) => role)
      .toArray();
  }

  addJoinRole(guild, role) {
    return Rx.Observable.of('')
      .flatMap(() => this.nix.getGuildData(guild.id, DataKeys.JoinRoles))
      .flatMap((roleIds) => Rx.Observable.if(
        () => roleIds.indexOf(role.id) === -1,
        Rx.Observable.of(roleIds),
        Rx.Observable.throw(new RoleAlreadyAddedError())
      ))
      .map((roleIds) => ([...roleIds, role.id]))
      .flatMap((roleIds) => this.nix.setGuildData(guild.id, DataKeys.JoinRoles, roleIds));
  }

  removeJoinRole(guild, role) {
    return Rx.Observable.of('')
      .flatMap(() => this.nix.getGuildData(guild.id, DataKeys.JoinRoles))
      .flatMap((roleIds) => Rx.Observable.if(
        () => roleIds.indexOf(role.id) > -1,
        Rx.Observable.of(roleIds),
        Rx.Observable.throw(new RoleNotAddedError())
      ))
      .map((roleIds) => {
        roleIds = [...roleIds];
        roleIds.splice(roleIds.indexOf(role.id), 1);
        return roleIds;
      })
      .flatMap((roleIds) => this.nix.setGuildData(guild.id, DataKeys.JoinRoles, roleIds));
  }
}

module.exports = AutoRoleService;
