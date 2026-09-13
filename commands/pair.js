module.exports = {
  name: 'pair',
  description: 'Group mein se do random logon ka pair banata hai (fun ke liye)',
  async execute(msg, args, chat) {
    if (!chat.isGroup) return msg.reply('Ye command sirf group mein kaam karti hai.');

    const participants = chat.participants;
    if (participants.length < 2) return msg.reply('Group mein kam log hain pair banane ke liye 😅');

    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const p1 = shuffled[0];
    const p2 = shuffled[1];
    const percent = Math.floor(Math.random() * 41) + 60; // 60-100%

    return msg.reply(
      `💘 *Aaj ka Pair* 💘\n\n` +
      `@${p1.id.user} ❤️ @${p2.id.user}\n\n` +
      `Match: ${percent}%`,
      undefined,
      { mentions: [`${p1.id.user}@c.us`, `${p2.id.user}@c.us`] }
    );
  },
};
