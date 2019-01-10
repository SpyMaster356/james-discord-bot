export default {
  ownerUserId: null,
  loginToken: null,

  logger: {
    level: "debug",
  },

  dataSource: {
    type: 'disk',
    dataDir: Path.join(__dirname, '../data'),
  },
}
