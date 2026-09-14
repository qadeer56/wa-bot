const { Client, LocalAuth } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');
const http = require('http');
const QRCode = require('qrcode');

// ==========================================
// SETTINGS
// ==========================================

const PORT = process.env.PORT || 8080;

// QR storage
let qrImage = null;
let botReady = false;

// ==========================================
// QR WEB SERVER
// ==========================================

const server = http.createServer((req, res) => {

  if (req.url === '/') {

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });

    // Bot connected
    if (botReady) {

      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>WhatsApp Bot</title>
        </head>

        <body style="
          font-family: Arial;
          text-align: center;
          padding: 40px;
        ">

          <h1>✅ WhatsApp Bot Online</h1>

          <p>Bot successfully connected.</p>

        </body>
        </html>
      `);

      return;
    }

    // QR not ready yet
    if (!qrImage) {

      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta http-equiv="refresh" content="3">
          <title>WhatsApp QR</title>
        </head>

        <body style="
          font-family: Arial;
          text-align: center;
          padding: 40px;
        ">

          <h2>⏳ QR Code Loading...</h2>

          <p>Please wait...</p>

        </body>
        </html>
      `);

      return;
    }

    // Show QR
    res.end(`
      <!DOCTYPE html>
      <html>

      <head>
        <meta name="viewport"
              content="width=device-width, initial-scale=1">

        <title>WhatsApp QR Code</title>
      </head>

      <body style="
        font-family: Arial;
        text-align: center;
        padding: 20px;
      ">

        <h2>📱 Scan QR Code</h2>

        <p>
          WhatsApp → Linked Devices → Link a device
        </p>

        <img
          src="${qrImage}"
          style="
            width: 320px;
            max-width: 90vw;
          "
        >

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

// Start web server
server.listen(PORT, () => {

  console.log(`🌐 Web server running on port ${PORT}`);

});

// ==========================================
// WHATSAPP CLIENT
// ==========================================

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

// ==========================================
// QR EVENT
// ==========================================

client.on('qr', async (qr) => {

  try {

    qrImage = await QRCode.toDataURL(qr, {
      width: 500,
      margin: 2
    });

    console.log('');
    console.log('================================');
    console.log('📱 QR CODE READY');
    console.log('================================');
    console.log('Open Railway URL and scan QR.');
    console.log('================================');
    console.log('');

  } catch (error) {

    console.error(
      '❌ QR generation error:',
      error
    );

  }

});

// ==========================================
// AUTHENTICATED
// ==========================================

client.on('authenticated', () => {

  console.log('🔐 WhatsApp authentication successful.');

});

// ==========================================
// READY
// ==========================================

client.on('ready', () => {

  botReady = true;
  qrImage = null;

  console.log('');
  console.log('================================');
  console.log('✅ BOT READY');
  console.log('================================');
  console.log('WhatsApp successfully connected.');
  console.log('================================');
  console.log('');

});

// ==========================================
// AUTH FAILURE
// ==========================================

client.on('auth_failure', (error) => {

  console.error(
    '❌ Authentication failed:',
    error
  );

});

// ==========================================
// DISCONNECTED
// ==========================================

client.on('disconnected', (reason) => {

  botReady = false;

  console.log(
    '⚠️ WhatsApp disconnected:',
    reason
  );

});

// ==========================================
// MESSAGE CREATE (Captures Direct, Group & Self Messages)
// ==========================================

client.on('message_create', async (msg) => {

  try {

    const text = (msg.body || '')
      .trim()
      .toLowerCase();

    // Console log for debugging
    if (text) {
      console.log(`📩 [MESSAGE]: ${msg.body} | From: ${msg.from}`);
    }

    // ========================================
    // COMMANDS (.menu, .owner, .help, etc.)
    // ========================================

    if (text === '.menu' || text === '.help') {

      await msg.reply(
        '📜 *BOT MENU*\n\n' +
        '1. .ping - Check Bot Status\n' +
        '2. .owner - Bot Owner Info\n' +
        '3. hello - Greetings'
      );

      console.log('✅ Menu reply sent.');

      return;
    }

    if (text === '.owner') {

      await msg.reply(
        '👑 *Bot Owner:* Qadeer Khan'
      );

      console.log('✅ Owner reply sent.');

      return;
    }

    // ========================================
    // GENERAL KEYWORDS
    // ========================================

    if (
      text === 'hello' ||
      text === 'hi' ||
      text === 'hey' ||
      text === '.hi'
    ) {

      await msg.reply(
        '👋 Hello! Main tumhara WhatsApp bot hoon.'
      );

      console.log('✅ Reply sent.');

      return;
    }

    if (text === 'bot') {

      await msg.reply(
        '🤖 Haan bhai, main online hoon!'
      );

      console.log('✅ Reply sent.');

      return;
    }

    if (text === 'ping' || text === '.ping') {

      await msg.reply(
        '🏓 Pong!'
      );

      console.log('✅ Reply sent.');

      return;
    }

  } catch (error) {

    console.error(
      '❌ Message error:',
      error
    );

  }

});

// ==========================================
// START BOT
// ==========================================

console.log('');
console.log('================================');
console.log('🚀 STARTING WHATSAPP BOT');
console.log('================================');
console.log('⏳ Starting WhatsApp Web...');
console.log('');

client.initialize().catch((error) => {

  console.error('');
  console.error(
    '❌ WhatsApp initialization failed:'
  );

  console.error(error);

});
