const RaidService = require('./services/raid-service');

module.exports = {
  name: "iron-family",
  enabledByDefault: true,
  defaultData: [
    {keyword: RaidService.DataKeys.UsersToNotify, data: []}
  ],
  services: [
    RaidService,
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
