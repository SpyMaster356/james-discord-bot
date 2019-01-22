const NixCore = require('nix-core');
const Path = require('path');

const localConfig = require('./config');

let james = new NixCore({
  dataSource: {
    type: "disk",
    dataDir: Path.join(__dirname, './data'),
  },
  ...localConfig
});

james.addModule(require('./plugins/iron-family'));

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
