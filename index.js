const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const puppeteer = require('puppeteer');

const { OWNER_NUMBER, PREFIX } = require('./config');
const { loadCommands } = require('./utils/commandLoader');
const { isGreeting, getGreetingReply } = require('./utils/greeting');
const { isAutochatOn } = require('./utils/state');
const { getAIReply } = require('./ai/persona');

const commands = loadCommands();

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    executablePath: puppeteer.executablePath(),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  },
});

client.on('qr', (qr) => {
  console.log('📱 QR code scan karo apne WhatsApp se (Linked Devices):');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ Bot ready! WhatsApp se connect ho gaya.');
});

client.on('message', async (msg) => {
  try {
    const chat = await msg.getChat();
    const body = msg.body?.trim() || '';
    const senderId = msg.author || msg.from;

    if (body.startsWith(PREFIX)) {
      const [cmdName, ...args] = body.slice(PREFIX.length).trim().split(/\s+/);
      const command = commands.get(cmdName.toLowerCase());

      if (!command) return;

      if (command.ownerOnly && senderId !== OWNER_NUMBER) {
        return msg.reply('❌ Ye command sirf owner use kar sakta hai.');
      }

      return command.execute(msg, args, chat, client, commands);
    }

    if (isGreeting(body)) {
      return msg.reply(getGreetingReply());
    }

    if (isAutochatOn(chat.id._serialized) && body.length > 0) {
      const reply = await getAIReply(chat.id._serialized, body);
      return msg.reply(reply);
    }
  } catch (err) {
    console.error('Message handling error:', err);
  }
});

client.initialize();
