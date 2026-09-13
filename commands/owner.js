const { OWNER_NUMBER, OWNER_NAME, BOT_NAME } = require('../config');

module.exports = {
  name: 'owner',
  description: 'Bot ke owner ki details dikhata hai',
  async execute(msg) {
    const ownerNum = OWNER_NUMBER?.split('@')[0] || 'Not set';
    return msg.reply(
      `👑 *Owner Info*\n\n` +
      `🤖 Bot: ${BOT_NAME}\n` +
      `🙋 Naam: ${OWNER_NAME}\n` +
      `📱 Number: @${ownerNum}\n` +
      `💬 Direct message: https://wa.me/${ownerNum}`
    );
  },
};
