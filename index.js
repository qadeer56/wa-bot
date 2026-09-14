require('dotenv').config();
const config = require('./config');
const { Client, LocalAuth } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');
const http = require('http');
const QRCode = require('qrcode');

const PORT = process.env.PORT || 8080;
let qrImage = null;
let botReady = false;

// ==========================================
// WEB SERVER (For QR Display)
// ==========================================
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

    if (botReady) {
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><meta name="viewport" content="width=device-width, initial-scale=1"><title>${config.BOT_NAME}</title></head>
        <body style="font-family: Arial; text-align: center; padding: 40px;">
          <h1>✅ ${config.BOT_NAME} Online</h1>
          <p>Bot successfully connected.</p>
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
        <body style="font-family: Arial; text-align: center; padding: 40px;">
          <h2>⏳ QR Code Loading...</h2>
          <p>Please wait...</p>
        </body>
        </html>
      `);
      return;
    }

    res.end(`
      <!DOCTYPE html>
      <html>
      <head><meta name="viewport" content="width=device-width, initial-scale=1"><title>WhatsApp QR Code</title></head>
      <body style="font-family: Arial; text-align: center; padding: 20px;">
        <h2>📱 Scan QR Code</h2>
        <p>WhatsApp → Linked Devices → Link a device</p>
        <img src="${qrImage}" style="width: 320px; max-width: 90vw;">
        <p>QR expire ho jaye to page refresh karo.</p>
      </body>
      </html>
    `);
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// ==========================================
// WHATSAPP CLIENT CONFIGURATION
// ==========================================
const client = new Client({
  authStrategy: new LocalAuth(),
  // Fixes WhatsApp Web crash & message handling errors
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
  },
  puppeteer: {
    headless: true,
    executablePath: config.PUPPETEER_EXECUTABLE_PATH || process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
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

client.on('qr', async (qr) => {
  try {
    qrImage = await QRCode.toDataURL(qr, { width: 500, margin: 2 });
    console.log('\n================================\n📱 QR CODE READY\n================================\nOpen Railway URL and scan QR.\n================================\n');
  } catch (error) {
    console.error('❌ QR generation error:', error);
  }
});

client.on('authenticated', () => {
  console.log('🔐 WhatsApp authentication successful.');
});

client.on('ready', () => {
  botReady = true;
  qrImage = null;
  console.log(`\n================================\n✅ ${config.BOT_NAME} IS READY\n================================\nWhatsApp successfully connected.\n================================\n`);
});

client.on('auth_failure', (error) => {
  console.error('❌ Authentication failed:', error);
});

client.on('disconnected', (reason) => {
  botReady = false;
  console.log('⚠️ WhatsApp disconnected:', reason);
});

// ==========================================
// MESSAGE EVENT (Group, Direct & Self Messages)
// ==========================================
client.on('message_create', async (msg) => {
  try {
    const text = (msg.body || '').trim().toLowerCase();
    const prefix = config.PREFIX || '.';

    if (text) {
      console.log(`📩 [MESSAGE]: ${msg.body} | From: ${msg.from}`);
    }

    // COMMANDS
    if (text === `${prefix}menu` || text === `${prefix}help`) {
      await msg.reply(
        `📜 *${config.BOT_NAME} MENU*\n\n` +
        `1. ${prefix}ping - Check Status\n` +
        `2. ${prefix}owner - Owner Info\n` +
        `3. hello - Greetings`
      );
      console.log('✅ Menu reply sent.');
      return;
    }

    if (text === `${prefix}owner`) {
      await msg.reply(`👑 *Bot Owner:* ${config.OWNER_NAME}`);
      console.log('✅ Owner reply sent.');
      return;
    }

    if (text === 'hello' || text === 'hi' || text === 'hey' || text === `${prefix}hi`) {
      await msg.reply(`👋 Hello! Main ${config.BOT_NAME} hoon.`);
      console.log('✅ Reply sent.');
      return;
    }

    if (text === 'bot') {
      await msg.reply('🤖 Haan bhai, main online hoon!');
      console.log('✅ Reply sent.');
      return;
    }

    if (text === 'ping' || text === `${prefix}ping`) {
      await msg.reply('🏓 Pong!');
      console.log('✅ Reply sent.');
      return;
    }

  } catch (error) {
    console.error('❌ Message handling error:', error);
  }
});

console.log(`\n================================\n🚀 STARTING ${config.BOT_NAME}\n================================\n⏳ Starting WhatsApp Web...\n`);

client.initialize().catch((error) => {
  console.error('\n❌ WhatsApp initialization failed:', error);
});
