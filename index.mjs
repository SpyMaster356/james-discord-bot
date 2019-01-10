import fs from 'fs';
import NixCore from "nix-core";

import config from './config';

let james = new NixCore(config);

// Load every module in the modules folder
fs.readdirSync('./modules')
  .forEach((file) => {
    nix.addModule(require('./modules/' + file));
  });

james.listen()
  .subscribe(
    () => nix.discord.user.setPresence({game: {name: `v${packageJson.version}`}}),
    (error) => onNixError(error),
    () => onNixComplete()
  );

function onNixError(error) {
  console.error(error);
  nix.messageOwner('Shutting down due to unhandled error: ' + error)
    .subscribe(
      () => {},
      () => {},
      () => process.exit(1)
    );
}

function onNixComplete() {
  console.log('Shutting down');
  nix.messageOwner('Jasmine shutting down')
    .subscribe(
      () => {},
      () => {},
      () => process.exit(0)
    );
}
