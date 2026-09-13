const { PREFIX, BOT_NAME } = require('../config');

module.exports = {
  name: 'menu',
  description: 'Sab commands ki list dikhata hai',
  async execute(msg, args, chat, client, allCommands) {
    let text = `🤖 *${BOT_NAME} - Command Menu*\n\n`;
    for (const cmd of allCommands.values()) {
      text += `${PREFIX}${cmd.name} - ${cmd.description}${cmd.ownerOnly ? ' (owner only)' : ''}\n`;
    }
    text += `\n💬 Bina command ke bhi msg karo - agar autochat "on" hai to normal baat bhi karunga!`;
    return msg.reply(text);
  },
};
