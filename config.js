require('dotenv').config();

module.exports = {
  OWNER_NUMBER: process.env.OWNER_NUMBER,
  OWNER_NAME: process.env.OWNER_NAME || 'Owner',
  BOT_NAME: process.env.BOT_NAME || 'Bot',
  PREFIX: process.env.PREFIX || '.',

  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  WEATHER_API_KEY: process.env.WEATHER_API_KEY,

  PUPPETEER_EXECUTABLE_PATH:
    process.env.PUPPETEER_EXECUTABLE_PATH,
};
