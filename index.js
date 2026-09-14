const { Client, LocalAuth } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');
const http = require('http');
const QRCode = require('qrcode');

const { OWNER_NUMBER, PREFIX } = require('./config');
const { loadCommands } = require('./utils/commandLoader');
const { isGreeting, getGreetingReply } = require('./utils/greeting');
const { isAutochatOn } = require('./utils/state');
const { getAIReply } = require('./ai/persona');

const commands = loadCommands();

// ==================================================
// QR STORAGE
// ==================================================

let qrImage = null;
let botReady = false;

// ==================================================
// QR WEB SERVER
// ==================================================

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {

  if (req.url === '/') {

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });

    if (botReady) {
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>WhatsApp Bot</title>
        </head>
        <body style="text-align:center;font-family:Arial;padding:30px;">
          <h1>✅ WhatsApp Bot Connected</h1>
          <p>Bot already linked successfully.</p>
        </body>
        </html>
      `);

      return;
    }

    if (!qrImage) {
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta http-equiv="refresh" content="3">
          <title>WhatsApp QR</title>
        </head>
        <body style="text-align:center;font-family:Arial;padding:30px;">
          <h2>⏳ QR Code Loading...</h2>
          <p>Page automatically refresh hogi.</p>
        </body>
        </html>
      `);

      return;
    }

    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>WhatsApp QR Code</title>
      </head>

      <body style="
        text-align:center;
        font-family:Arial;
        background:#ffffff;
        padding:20px;
      ">

        <h2>📱 WhatsApp QR Code</h2>

        <p>
          Apne main phone ke WhatsApp se is QR ko scan karo.
        </p>

        <img
          src="${qrImage}"
          style="
            width:320px;
            max-width:90vw;
            height:auto;
            image-rendering:pixelated;
          "
        >

        <p style="margin-top:20px;">
          WhatsApp → Settings → Linked Devices → Link a device
        </p>

        <p>
          QR expire ho jaye to page refresh karo.
        </p>

      </body>
      </html>
    `);

    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`🌐 QR server running on port ${PORT}`);

  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    console.log(
      `🔗 QR OPEN KARNE KA LINK: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    );
  } else {
    console.log(
      '⚠️ Railway Public Domain abhi set nahi hai.'
    );
  }
});

// ==================================================
// WHATSAPP CLIENT
// ==================================================

const client = new Client({
  authStrategy: new LocalAuth(),

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
      '--disable-extensions'
    ]
  }
});

// ==================================================
// QR EVENT
// ==================================================

client.on('qr', async (qr) => {

  try {

    qrImage = await QRCode.toDataURL(qr, {
      width: 500,
      margin: 2
    });

    console.log('');
    console.log('========================================');
    console.log('       📱 QR CODE READY');
    console.log('========================================');

    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      console.log(
        `🔗 https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      );
    }

    console.log('========================================');
    console.log('');

  } catch (error) {
    console.error('❌ QR generation error:', error);
  }
});

// ==================================================
// AUTHENTICATED
// ==================================================

client.on('authenticated', () => {
  console.log('🔐 WhatsApp authentication successful.');
});

// ==================================================
// READY
// ==================================================

client.on('ready', () => {

  botReady = true;
  qrImage = null;

  console.log('');
  console.log('========================================');
  console.log('       ✅ BOT READY');
  console.log('========================================');
  console.log('WhatsApp successfully connected!');
  console.log('');
});

// ==================================================
// AUTH FAILURE
// ==================================================

client.on('auth_failure', (msg) => {
  console.error('❌ WhatsApp authentication failed:', msg);
});

// ==================================================
// DISCONNECTED
// ==================================================

client.on('disconnected', (reason) => {
  console.log('⚠️ WhatsApp disconnected:', reason);

  botReady = false;
});

// ==================================================
// LOADING
// ==================================================

client.on('loading_screen', (percent, message) => {
  console.log(
    `⏳ WhatsApp loading: ${percent}% - ${message}`
  );
});

// ==================================================
// MESSAGE HANDLER
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

      const command = commands.get(
        cmdName.toLowerCase()
      );

      if (!command) return;

      if (
        command.ownerOnly &&
        senderId !== OWNER_NUMBER
      ) {
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
      return msg.reply(
        getGreetingReply()
      );
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
// START
// ==================================================

console.log('');
console.log('========================================');
console.log('       🚀 STARTING WHATSAPP BOT');
console.log('========================================');
console.log('⏳ Starting WhatsApp Web...');
console.log('');

client.initialize().catch((err) => {

  console.error('');
  console.error(
    '❌ WhatsApp initialization failed:'
  );

  console.error(err);

});
