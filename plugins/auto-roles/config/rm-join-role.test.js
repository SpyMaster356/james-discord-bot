const Collection = require('discord.js').Collection;
const ConfigAction = require('nix-core').ConfigAction;

const AutoRoleService = require('../services/auto-role-service');
const rmJoinRole = require('./rm-join-role');

describe('!config autoRole rmJoinRole {role}', function () {
  beforeEach(function () {
    this.nix = createNixStub();
    this.autoRoleService = new AutoRoleService(this.nix);

    this.nix.stubService('autoRoles', 'AutoRoleService', this.autoRoleService);

    this.rmJoinRole = new ConfigAction(rmJoinRole);
    this.rmJoinRole.nix = this.nix;

    this.rmJoinRole.configureAction();
  });

  context('#configureAction', function() {
    it('loads the AutoRoleService', function () {
      expect(this.rmJoinRole.autoRoleService).to.eq(this.autoRoleService);
    });
  });

  describe('#run', function () {
    beforeEach(function (done) {
      this.guild = {
        id: "22222",
        name: "Test Guild",
        roles: new Collection(),
      };

      this.role = {id: "11111", name: "Role1"};

      this.context = {
        guild: this.guild,
        inputs: {
          role: this.role.id,
        },
      };

      this.autoRoleService.addJoinRole(this.guild, this.role)
        .subscribe(() => {}, (error) => done(error), () => done());
    });

    context('when a role is not given', function () {
      beforeEach(function () {
        this.context.inputs.role = undefined;
      });

      it('emits an error message', function (done) {
        expect(this.rmJoinRole.run(this.context)).to.emit([
          {
            status: 400,
            content: "The name of a role to remove is required",
          }
        ]).and.complete(done)
      });
    });

    context('when the role is not on the list', function () {
      beforeEach(function (done) {
        this.guild.roles.set(this.role.id, this.role);

        this.autoRoleService.removeJoinRole(this.guild, this.role)
          .subscribe(() => {}, (error) => done(error), () => done());
      });

      it('emits an error message', function (done) {
        expect(this.rmJoinRole.run(this.context)).to.emit([
          {
            status: 400,
            message: "That role is not on the list.",
          }
        ]).and.complete(done)
      });
    });

    [
      {type: "a mention", value: "<@&11111>"},
      {type: "a name", value: "Role1"},
      {type: "an id", value: "11111"},
    ].forEach((input) => {
      context(`when a role is given as ${input.type}`, function() {
        beforeEach(function () {
          this.context.inputs.role = input.value;
        });

        context('when the role exists in the guild', function() {
          beforeEach(function () {
            this.guild.roles.set(this.role.id, this.role);
          });

          it('adds the correct role to the list', function (done) {
            sinon.spy(this.autoRoleService, 'removeJoinRole');

            expect(this.rmJoinRole.run(this.context)).to.complete(done, () => {
              expect(this.autoRoleService.removeJoinRole)
                .to.have.been.calledWith(this.guild, this.role)
            })
          });

          it('emits a success message', function (done) {
            expect(this.rmJoinRole.run(this.context)).to.emit([
              {
                status: 200,
                content: "the role Role1 has been removed from the list.",
              }
            ]).and.complete(done)
          });
        });

        context('when the role does not exist in the guild', function() {
          it('emits an error message', function (done) {
            expect(this.rmJoinRole.run(this.context)).to.emit([
              {
                status: 404,
                content: `The role '${input.value}' could not be found.`,
              }
            ]).and.complete(done)
          });
        });
      });
    });
  });
});
