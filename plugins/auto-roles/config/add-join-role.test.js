const Collection = require('discord.js').Collection;
const ConfigAction = require('nix-core').ConfigAction;

const AutoRoleService = require('../services/auto-role-service');
const addJoinRole = require('./add-join-role');

describe('!config autoRole addJoinRole {role}', function () {
  beforeEach(function () {
    this.nix = createNixStub();
    this.autoRoleService = new AutoRoleService(this.nix);

    this.nix.stubService('autoRole', 'AutoRoleService', this.autoRoleService);

    this.addJoinRole = new ConfigAction(addJoinRole);
    this.addJoinRole.nix = this.nix;

    this.addJoinRole.configureAction();
  });

  context('#configureAction', function() {
    it('loads the RaidService', function () {
      expect(this.addJoinRole.autoRoleService).to.eq(this.autoRoleService);
    });
  });

  describe('#run', function () {
    beforeEach(function () {
      this.guild = {
        id: "22222",
        name: "Test Guild",
        roles: new Collection(),
      };

      this.role = {id: "11111", name: "Role1"};

      this.context = {
        guild: this.guild,
        inputs: {},
      }
    });

    context('when a role is not given', function () {
      it('emits an error message', function (done) {
        expect(this.addJoinRole.run(this.context)).to.emit([
          {
            status: 400,
            content: "The name of a role to assign is required",
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
            sinon.spy(this.autoRoleService, 'addJoinRole');

            expect(this.addJoinRole.run(this.context)).to.complete(done, () => {
              expect(this.autoRoleService.addJoinRole)
                .to.have.been.calledWith(this.guild, this.role)
            })
          });

          it('emits a success message', function (done) {
            expect(this.addJoinRole.run(this.context)).to.emit([
              {
                status: 200,
                content: "the role Role1 will be granted to users when they join",
              }
            ]).and.complete(done)
          });
        });

        context('when the role does not exist in the guild', function() {
          it('emits an error message', function (done) {
            expect(this.addJoinRole.run(this.context)).to.emit([
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
