const { createCanvas } = require('canvas');
const { MessageMedia } = require('whatsapp-web.js');

function drawCard({ title, line1, line2, bg1, bg2 }) {
  const canvas = createCanvas(700, 400);
  const ctx = canvas.getContext('2d');

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, 700, 400);
  grad.addColorStop(0, bg1);
  grad.addColorStop(1, bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 700, 400);

  // Title
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 40px Sans';
  ctx.textAlign = 'center';
  ctx.fillText(title, 350, 100);

  // Big heart / icon text
  ctx.font = '60px Sans';
  ctx.fillText('❤️', 350, 200);

  // Names
  ctx.font = 'bold 34px Sans';
  ctx.fillText(line1, 350, 280);
  ctx.font = '26px Sans';
  ctx.fillText(line2, 350, 330);

  return canvas.toBuffer('image/png');
}

module.exports = {
  name: 'lovecard',
  description: 'Love card banata hai (.lovecard Naam1 Naam2)',
  async execute(msg, args) {
    if (args.length < 2) return msg.reply('Likho: .lovecard Naam1 Naam2');
    const [name1, name2] = args;
    const percent = Math.floor(Math.random() * 41) + 60;

    const buffer = drawCard({
      title: '💕 Love Card 💕',
      line1: `${name1}  ×  ${name2}`,
      line2: `Match: ${percent}%`,
      bg1: '#ff5f6d',
      bg2: '#ffc371',
    });

    const media = new MessageMedia('image/png', buffer.toString('base64'), 'lovecard.png');
    return msg.reply(media);
  },
};
