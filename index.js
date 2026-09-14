const { Client, LocalAuth } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');

const { OWNER_NUMBER, PREFIX } = require('./config');
const { loadCommands } = require('./utils/commandLoader');
const { isGreeting, getGreetingReply } = require('./utils/greeting');
const { isAutochatOn } = require('./utils/state');
const { getAIReply } = require('./ai/persona');

const commands = loadCommands();

// ==================================================
// WhatsApp account number
// Country code ke sath, + ke baghair
// ==================================================

const PHONE_NUMBER = '923157271744';

// ==================================================
// WhatsApp Client
// ==================================================

const client = new Client({
  authStrategy: new LocalAuth(),

  // Pairing Code Login
  pairWithPhoneNumber: {
    phoneNumber: PHONE_NUMBER,
    showNotification: true,
    intervalMs: 180000,
  },

  puppeteer: {
    headless: true,

    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      puppeteer.executablePath(),

    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--disable-extensions',
    ],
  },
});

// ==================================================
// Pairing Code
// ==================================================

client.on('code', (code) => {
  console.log('');
  console.log('========================================');
  console.log('       📱 WHATSAPP PAIRING CODE');
  console.log('========================================');
  console.log(`       ${code}`);
  console.log('========================================');
  console.log('');
  console.log('WhatsApp > Settings > Linked Devices');
  console.log('> Link a device > Link with phone number');
  console.log('');
});

// ==================================================
// Ready
// ==================================================

client.on('ready', () => {
  console.log('');
  console.log('========================================');
  console.log('       ✅ BOT READY');
  console.log('========================================');
  console.log('WhatsApp successfully connected!');
  console.log('');
});

// ==================================================
// Authentication
// ==================================================

client.on('authenticated', () => {
  console.log('🔐 WhatsApp authentication successful.');
});

client.on('auth_failure', (msg) => {
  console.error('❌ WhatsApp authentication failed:', msg);
});

// ==================================================
// Disconnected
// ==================================================

client.on('disconnected', (reason) => {
  console.log('⚠️ WhatsApp disconnected:', reason);
});

// ==================================================
// Loading
// ==================================================

client.on('loading_screen', (percent, message) => {
  console.log(`⏳ WhatsApp loading: ${percent}% - ${message}`);
});

// ==================================================
// Message Handler
// ==================================================

client.on('message', async (msg) => {
  try {
    const chat = await msg.getChat();

    const body = msg.body?.trim() || '';

    const senderId = msg.author || msg.from;

    // ==================================================
    // COMMANDS
    // ==================================================

    if (body.startsWith(PREFIX)) {
      const [cmdName, ...args] = body
        .slice(PREFIX.length)
        .trim()
        .split(/\s+/);

      const command = commands.get(cmdName.toLowerCase());

      if (!command) return;

      // Owner-only command
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

    // ==================================================
    // GREETING
    // ==================================================

    if (isGreeting(body)) {
      return msg.reply(getGreetingReply());
    }

    // ==================================================
    // AI AUTOCHAT
    // ==================================================

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

// ==================================================
// START BOT
// ==================================================

console.log('');
console.log('========================================');
console.log('       🚀 STARTING WHATSAPP BOT');
console.log('========================================');
console.log(`📱 Pairing number: ${PHONE_NUMBER}`);
console.log('⏳ Starting WhatsApp Web...');
console.log('');

client.initialize().catch((err) => {
  console.error('');
  console.error('❌ WhatsApp initialization failed:');
  console.error(err);
});
