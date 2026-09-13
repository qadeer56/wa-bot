const axios = require('axios');
const { WEATHER_API_KEY } = require('../config');

module.exports = {
  name: 'weather',
  description: 'Kisi city ka weather batao (.weather karachi)',
  async execute(msg, args) {
    const city = args.join(' ');
    if (!city) return msg.reply('Likho: .weather karachi');
    if (!WEATHER_API_KEY) return msg.reply('Owner ne weather API key set nahi ki abhi.');

    try {
      const { data } = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: { q: city, appid: WEATHER_API_KEY, units: 'metric', lang: 'ur' },
      });

      return msg.reply(
        `🌦️ *Weather in ${data.name}*\n\n` +
        `🌡️ Temp: ${data.main.temp}°C (feels like ${data.main.feels_like}°C)\n` +
        `☁️ Condition: ${data.weather[0].description}\n` +
        `💧 Humidity: ${data.main.humidity}%\n` +
        `💨 Wind: ${data.wind.speed} m/s`
      );
    } catch (err) {
      return msg.reply(`City "${city}" nahi mila, sahi naam likho.`);
    }
  },
};
