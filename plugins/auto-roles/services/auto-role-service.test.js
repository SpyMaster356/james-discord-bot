const AutoRoleService = require('./auto-role-service');
const DataKeys = require('../data-keys');

const {
  RoleAlreadyAddedError,
  RoleNotAddedError,
} = require('../errors');

describe('AutoRoleService', function () {
  beforeEach(function (done) {
    this.nix = createNixStub();
    this.autoRoleService = new AutoRoleService(this.nix);

    this.guild = {
      id: '0000-guild-1',
      name: 'Test Guild',
      roles: new Map(),
    };

    this.nix.setGuildData(this.guild.id, DataKeys.JoinRoles, [])
      .subscribe(() => {}, (error) => done(error), () => done());
  });

  describe('#getJoinRoles', function () {
    context('when there are no roles', function () {
      beforeEach(function (done) {
        this.nix.setGuildData(this.guild.id, DataKeys.JoinRoles, [])
          .subscribe(() => {}, (error) => done(error), () => done());
      });

      it('emits an empty array', function (done) {
        expect(this.autoRoleService.getJoinRoles(this.guild))
          .to.emit([[]]).and.complete(done);
      });
    });

    context('when there are roles', function () {
      beforeEach(function (done) {
        this.roles = [
          {id: '0000-role-1', name: 'Role1'},
          {id: '0000-role-2', name: 'Role2'},
          {id: '0000-role-3', name: 'Role3'},
        ];

        this.roles.forEach((role) => this.guild.roles.set(role.id, role));

        this.nix.setGuildData(this.guild.id, DataKeys.JoinRoles, this.roles.map((role) => role.id))
          .subscribe(() => {}, (error) => done(error), () => done());
      });

      it('emits an array of roles for each id', function (done) {
        expect(this.autoRoleService.getJoinRoles(this.guild))
          .to.emit([this.roles]).and.complete(done);
      });

      context('when not all roles exist in the guild', function () {
        beforeEach(function () {
          this.guild.roles.delete(this.roles[0].id);
        });

        it('emits an array of roles that were found', function (done) {
          expect(this.autoRoleService.getJoinRoles(this.guild))
            .to.emit([this.roles.slice(1)]).and.complete(done);
        });
      });
    });
  });

  describe('#addJoinRole', function () {
    beforeEach(function () {
      this.role = { id: "00000-role-1", name: "role-1" };
    });

    it('it updates the join role list', function (done) {
      let stream$ = this.autoRoleService.addJoinRole(this.guild, this.role)
        .flatMap(() => this.nix.getGuildData(this.guild.id, DataKeys.JoinRoles));

      expect(stream$).to.emit([ [this.role.id] ]).and.complete(done);
    });

    context('when there are other roles on the list', function() {
      beforeEach(function (done) {
        this.preExistingRole = {id: "00000-role-2", name: "role-2"};

        this.nix.setGuildData(this.guild.id, DataKeys.JoinRoles, [this.preExistingRole.id])
          .subscribe(() => {}, (error) => done(error), () => done());
      });

      it('appends the role to the list', function (done) {
        let stream$ = this.autoRoleService.addJoinRole(this.guild, this.role)
          .flatMap(() => this.nix.getGuildData(this.guild.id, DataKeys.JoinRoles));

        expect(stream$).to.emit([[this.preExistingRole.id, this.role.id]]).and.complete(done);
      });
    });

    context('when the role is already on the list', function () {
      beforeEach(function (done) {
        this.nix.setGuildData(this.guild.id, DataKeys.JoinRoles, [this.role.id])
          .subscribe(() => {}, (error) => done(error), () => done());
      });

      it('throws an RoleAlreadyAddedError', function (done) {
        expect(this.autoRoleService.addJoinRole(this.guild, this.role))
          .to.throw(RoleAlreadyAddedError).and.close(done);
      });
    });
  });

  describe('#removeJoinRole', function () {
    beforeEach(function (done) {
      this.role = {id: "00000-role-1", name: "role-1"};

      this.nix.setGuildData(this.guild.id, DataKeys.JoinRoles, [this.role.id])
        .subscribe(() => {}, (error) => done(error), () => done());
    });

    it('it updates the join role list', function (done) {
      let stream$ = this.autoRoleService.removeJoinRole(this.guild, this.role)
        .flatMap(() => this.nix.getGuildData(this.guild.id, DataKeys.JoinRoles));

      expect(stream$).to.emit([[]]).and.complete(done);
    });

    context('when there are other roles on the list', function () {
      beforeEach(function (done) {
        this.preExistingRole = {id: "00000-role-2", name: "role-2"};

        this.nix.setGuildData(this.guild.id, DataKeys.JoinRoles, [this.role.id, this.preExistingRole.id])
          .subscribe(() => {}, (error) => done(error), () => done());
      });

      it('appends the role to the list', function (done) {
        let stream$ = this.autoRoleService.removeJoinRole(this.guild, this.role)
          .flatMap(() => this.nix.getGuildData(this.guild.id, DataKeys.JoinRoles));

        expect(stream$).to.emit([[this.preExistingRole.id]]).and.complete(done);
      });
    });

    context('when the role is not on the list', function () {
      beforeEach(function (done) {
        this.nix.setGuildData(this.guild.id, DataKeys.JoinRoles, [])
          .subscribe(() => {}, (error) => done(error), () => done());
      });

      it('throws an RoleNotAddedError', function (done) {
        expect(this.autoRoleService.removeJoinRole(this.guild, this.role))
          .to.throw(RoleNotAddedError).and.close(done);
      });
    });
  });
});
