const NixCore = require('nix-core');

const config = require('./config');

let james = new NixCore(config);

james.addModule({
  name: "iron-family",
  enabledByDefault: true,
  services: [
    require('./lib/services/raid-service'),
  ],
  commands: [
    require('./lib/commands/raid'),
    require('./lib/commands/cancel'),
    require('./lib/commands/start'),
    require('./lib/commands/raiders'),
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
