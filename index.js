const NixCore = require('nix-core');
const Path = require('path');

const localConfig = require('./config');
const RaidService = require('./lib/services/raid-service');

let james = new NixCore({
  dataSource: {
    type: "disk",
    dataDir: Path.join(__dirname, './data'),
  },
  ...localConfig
});

james.addModule({
  name: "iron-family",
  enabledByDefault: true,
  defaultData: [
    { keyword: RaidService.DataKeys.UsersToNotify, data: [] }
  ],
  services: [
    RaidService,
  ],
  commands: [
    require('./lib/commands/raid'),
    require('./lib/commands/cancel'),
    require('./lib/commands/start'),
    require('./lib/commands/raiders'),
    require('./lib/commands/notify'),
    require('./lib/commands/unsub'),
  ],
});

james.listen()
  .subscribe(
    () => {},
    (error) => {
      console.error(error);
      process.exit(1);
    },
    () => {
      process.exit(0);
    },
  );
