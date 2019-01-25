const Rx = require('rx');
const Collection = require('discord.js').Collection;
const ConfigAction = require('nix-core').ConfigAction;

const AutoRoleService = require('../services/auto-role-service');
const listRoles = require('./list');

describe('!config autoRoles list', function () {
  beforeEach(function () {
    this.nix = createNixStub();
    this.autoRoleService = new AutoRoleService(this.nix);

    this.nix.stubService('autoRoles', 'AutoRoleService', this.autoRoleService);

    this.listRoles = new ConfigAction(listRoles);
    this.listRoles.nix = this.nix;

    this.listRoles.configureAction();
  });

  context('#configureAction', function () {
    it('loads the AutoRoleService', function () {
      expect(this.listRoles.autoRoleService).to.eq(this.autoRoleService);
    });
  });

  describe('#run', function () {
    beforeEach(function () {
      this.guild = {
        id: '22222',
        name: 'Test Guild',
        roles: new Collection(),
      };

      this.context = {
        guild: this.guild,
      };
    });

    it('emits a single response', function (done) {
      expect(this.listRoles.run(this.context)).to.emitLength(1).and.complete(done);
    });

    it('emits an embed', function (done) {
      this.listRoles.run(this.context)
        .subscribe(
          (response) => {
            expect(response).to.have.property('embed');
            done();
          },
          (error) => {
            done(error);
          },
        );
    });

    describe('roles list', function () {
      it('has section for the join roles', function (done) {
        let stream$ = this.listRoles.run(this.context)
          .flatMap((response) => response.embed.fields)
          .find((field) => field.name === 'Join Roles')
          .map((field) => expect(field).to.not.be.undefined);

        expect(stream$).to.emitLength(1).and.complete(done);
      });

      describe('join roles', function () {
        context('when there are no roles on the list', function () {
          it('adds a "Join Roles" field, with an empty list', function (done) {
            let stream$ = this.listRoles.run(this.context)
              .flatMap((response) => response.embed.fields)
              .find((field) => field.name === 'Join Roles')
              .map((field) => expect(field.value).to.eq('[None]'));

            expect(stream$).to.emitLength(1).and.complete(done);
          });
        });

        context('when there are roles on the list', function () {
          beforeEach(function (done) {
            this.roles = [
              {id: '0000-role-1', name: 'Role1'},
              {id: '0000-role-2', name: 'Role2'},
              {id: '0000-role-3', name: 'Role3'},
            ];

            Rx.Observable.from(this.roles)
              .do((role) => this.guild.roles.set(role.id, role))
              .concatMap((role) => this.autoRoleService.addJoinRole(this.guild, role))
              .subscribe(() => {}, (error) => done(error), () => done());
          });

          it('adds a "Join Roles" field, with a list of all assigned roles', function (done) {
            let stream$ = this.listRoles.run(this.context)
              .flatMap((response) => response.embed.fields)
              .find((field) => field.name === 'Join Roles')
              .map((field) => expect(field.value).to.eq('Role1, Role2, Role3'));

            expect(stream$).to.complete(done);
          });
        });
      });
    });
  });
});
