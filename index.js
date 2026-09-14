const { Client, LocalAuth } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');

const { OWNER_NUMBER, PREFIX } = require('./config');
const { loadCommands } = require('./utils/commandLoader');
const { isGreeting, getGreetingReply } = require('./utils/greeting');
const { isAutochatOn } = require('./utils/state');
const { getAIReply } = require('./ai/persona');

const commands = loadCommands();

// WhatsApp number in international format
const PHONE_NUMBER = '923409785011';

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

// ================================
// WhatsApp Pairing Code
// ================================

client.on('code', (code) => {
  console.log('');
  console.log('====================================');
  console.log('📱 WHATSAPP PAIRING CODE');
  console.log('====================================');
  console.log(`CODE: ${code}`);
  console.log('====================================');
  console.log('');
  console.log('WhatsApp → Settings → Linked Devices');
  console.log('→ Link a device');
  console.log('→ Link with phone number instead');
  console.log(`→ Enter this code: ${code}`);
  console.log('');
});

// ================================
// Authentication
// ================================

client.on('authenticated', () => {
  console.log('🔐 WhatsApp authenticated successfully!');
});

client.on('auth_failure', (message) => {
  console.error('❌ WhatsApp authentication failed:', message);
});

client.on('ready', () => {
  console.log('');
  console.log('====================================');
  console.log('✅ BOT READY!');
  console.log('✅ WhatsApp successfully connected.');
  console.log('====================================');
  console.log('');
});

client.on('disconnected', (reason) => {
  console.log('⚠️ WhatsApp disconnected:', reason);
});

// ================================
// Message Handler
// ================================

client.on('message', async (msg) => {
  try {
    const chat = await msg.getChat();
    const body = msg.body?.trim() || '';
    const senderId = msg.author || msg.from;

    // ================================
    // Commands
    // ================================

    if (body.startsWith(PREFIX)) {
      const [cmdName, ...args] = body
        .slice(PREFIX.length)
        .trim()
        .split(/\s+/);

      const command = commands.get(cmdName.toLowerCase());

      if (!command) return;

      if (command.ownerOnly && senderId !== OWNER_NUMBER) {
        return msg.reply(
          '❌ Ye command sirf owner use kar sakta hai.'
        );
      }

      return command.execute(
        msg,
        args,
        chat,
        client,
        commands
      );
    }

    // ================================
    // Greetings
    // ================================

    if (isGreeting(body)) {
      return msg.reply(getGreetingReply());
    }

    // ================================
    // AI Auto Chat
    // ================================

    if (
      isAutochatOn(chat.id._serialized) &&
      body.length > 0
    ) {
      const reply = await getAIReply(
        chat.id._serialized,
        body
      );

      return msg.reply(reply);
    }

  } catch (err) {
    console.error(
      '❌ Message handling error:',
      err
    );
  }
});

// ================================
// Start Bot
// ================================

console.log('🚀 Starting WhatsApp bot...');
console.log(`📱 Pairing number: ${PHONE_NUMBER}`);
console.log('⏳ Starting WhatsApp Web...');

client.initialize();
