const DataKeys = require('./data-keys');

module.exports = {
  name: "iron-family",
  enabledByDefault: true,
  defaultData: [
    {keyword: DataKeys.UsersToNotify, data: []}
  ],
  services: [
    require('./services/raid-service'),
  ],
  commands: [
    require('./commands/raid'),
    require('./commands/cancel'),
    require('./commands/start'),
    require('./commands/raiders'),
    require('./commands/notify'),
    require('./commands/unsub'),
  ],
};
