const fs = require('fs');
const path = require('path');

function loadCommands() {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const files = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));
  const commands = new Map();

  for (const file of files) {
    const loaded = require(path.join(commandsPath, file));
    // Kuch files ek command export karti hain, kuch array (jaise group.js)
    const items = Array.isArray(loaded) ? loaded : [loaded];
    for (const cmd of items) {
      commands.set(cmd.name, cmd);
    }
  }

  return commands;
}

module.exports = { loadCommands };
