const { setAutochat } = require('../utils/state');

module.exports = {
  name: 'autochat',
  ownerOnly: true, // sirf owner ye setting badal sakta hai
  description: 'AI se normal chat on/off karo (.autochat on / .autochat off)',
  async execute(msg, args, chat) {
    const value = args[0]?.toLowerCase();
    if (value !== 'on' && value !== 'off') {
      return msg.reply('Likho: .autochat on ya .autochat off');
    }
    setAutochat(chat.id._serialized, value === 'on');
    return msg.reply(`✅ Autochat ${value === 'on' ? 'ON' : 'OFF'} kar diya is chat mein.`);
  },
};
