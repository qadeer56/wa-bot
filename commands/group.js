const { OWNER_NUMBER } = require('../config');

// Bot ka group mein admin hona zaroori hai add/kick ke liye
async function checkBotIsAdmin(chat, client) {
  const botId = client.info.wid._serialized;
  const botParticipant = chat.participants.find((p) => p.id._serialized === botId);
  return botParticipant?.isAdmin || botParticipant?.isSuperAdmin;
}

const addCommand = {
  name: 'add',
  description: 'Group mein member add karo (.add 923xxxxxxxxx) - sirf owner/admin',
  ownerOnly: true,
  async execute(msg, args, chat, client) {
    if (!chat.isGroup) return msg.reply('Ye command sirf group mein chalti hai.');
    if (!(await checkBotIsAdmin(chat, client))) return msg.reply('❌ I need admin.');

    const number = args[0]?.replace(/\D/g, '');
    if (!number) return msg.reply('Likho: .add 923xxxxxxxxx');

    try {
      await chat.addParticipants([`${number}@c.us`]);
      return msg.reply(`✅ ${number} ko add kar diya.`);
    } catch (err) {
      return msg.reply('❌ Add nahi ho saka (shayad privacy settings block kar rahi hain).');
    }
  },
};

const kickCommand = {
  name: 'kick',
  description: 'Group se member remove karo (reply karke ya .kick 923xxxxxxxxx) - sirf owner/admin',
  ownerOnly: true,
  async execute(msg, args, chat, client) {
    if (!chat.isGroup) return msg.reply('Ye command sirf group mein chalti hai.');
    if (!(await checkBotIsAdmin(chat, client))) return msg.reply('❌ I need admin.');

    let targetId;
    if (msg.hasQuotedMsg) {
      const quoted = await msg.getQuotedMessage();
      targetId = quoted.author || quoted.from;
    } else if (args[0]) {
      targetId = `${args[0].replace(/\D/g, '')}@c.us`;
    }

    if (!targetId) return msg.reply('Kisi ka message reply karo ya number likho: .kick 923xxxxxxxxx');

    try {
      await chat.removeParticipants([targetId]);
      return msg.reply('✅ Remove kar diya.');
    } catch (err) {
      return msg.reply('❌ Remove nahi ho saka.');
    }
  },
};

module.exports = [addCommand, kickCommand];
