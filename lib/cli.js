const commander = require('commander')
const main = require('./main')
const pkg = require('../package.json')
const config = require('../config/appsettings.json');

(() => {
  commander.version(pkg.version)
    .requiredOption('-t, --token <token>', 'discord bot token')
    .option('-p, --prefix', 'command prefix', '!')
  commander.parse(process.argv)

  try {
    main.run({ token: commander.token, commandPrefix: commander.prefix ?? config.commandPrefix, config: config })
  } catch (error) {
    console.error(error)
  }
}).call(this)
