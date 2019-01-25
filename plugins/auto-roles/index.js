const DataKeys = require('./data-keys');

module.exports = {
  name: "autoRoles",
  enabledByDefault: true,
  defaultData: [
    {keyword: DataKeys.JoinRoles, data: []}
  ],
  services: [
    require('./services/auto-role-service'),
  ],
  configActions: [
    require('./config/add-join-role'),
    require('./config/rm-join-role'),
    require('./config/list'),
  ]
};
