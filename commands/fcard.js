const { createCanvas } = require('canvas');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
  name: 'fcard',
  description: 'Friendship card banata hai (.fcard Naam1 Naam2)',
  async execute(msg, args) {
    if (args.length < 2) return msg.reply('Likho: .fcard Naam1 Naam2');
    const [name1, name2] = args;

    const canvas = createCanvas(700, 400);
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 700, 400);
    grad.addColorStop(0, '#36d1dc');
    grad.addColorStop(1, '#5b86e5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 700, 400);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 40px Sans';
    ctx.fillText('🤝 Friendship Card 🤝', 350, 100);

    ctx.font = '60px Sans';
    ctx.fillText('👬', 350, 200);

    ctx.font = 'bold 34px Sans';
    ctx.fillText(`${name1}  &  ${name2}`, 350, 280);
    ctx.font = '24px Sans';
    ctx.fillText('Best Friends Forever', 350, 320);

    const buffer = canvas.toBuffer('image/png');
    const media = new MessageMedia('image/png', buffer.toString('base64'), 'fcard.png');
    return msg.reply(media);
  },
};
