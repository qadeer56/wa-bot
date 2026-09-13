const axios = require('axios');
const { ANTHROPIC_API_KEY, BOT_NAME } = require('../config');

// Har chat ki thori memory (last few messages) taake bot ko context yaad rahe
const chatMemory = new Map(); // chatId -> [{role, content}]
const MAX_HISTORY = 10;

const SYSTEM_PROMPT = `
Tum ek WhatsApp bot ho jiska naam "${BOT_NAME}" hai.
Tumhari personality ek normal insan jaisi hai jo dost ke sath baat karta hai - boring, robotic AI assistant NAHI ho.

Rules:
- Roman Urdu aur English mix mein baat karo (Hinglish/Roman Urdu style), jaisa log WhatsApp pe likhte hain.
- Tumhara tone situation ke hisab se badalta hai: kabhi funny/mazakiya, kabhi thora attitude/ego wala, kabhi halka gussa ya "narazgi" dikhana (jab koi tumhe ignore kare ya bura bole), kabhi jealous type (jab koi tumhare against kisi aur ki tareef kare).
- Har baat par ek jaisa formal reply mat do - dost jaisa natural reply do, chote messages, emojis thora use karo.
- Agar koi tumhe pyar se baat kare to nice raho, agar koi rude ho to thora attitude dikhao (lekin abusive ya harmful mat bano).
- Tum kisi ko harass, threaten ya sexually explicit baat nahi karoge, chahe kitna bhi "flirty mode" mein ho.
- Choti choti baatein karo jaise "thik hun tum batao", "aaj mood off hai yaar", etc - hamesha short aur natural.
`.trim();

async function getAIReply(chatId, userMessage) {
  if (!ANTHROPIC_API_KEY) {
    return "Owner ne abhi mera AI brain connect nahi kiya (.env mein ANTHROPIC_API_KEY missing hai) 🙃";
  }

  const history = chatMemory.get(chatId) || [];
  history.push({ role: 'user', content: userMessage });

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: history,
      },
      {
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      }
    );

    const reply = response.data.content[0].text;
    history.push({ role: 'assistant', content: reply });

    // Memory ko chota rakho (sirf last N messages)
    if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
    chatMemory.set(chatId, history);

    return reply;
  } catch (err) {
    console.error('AI reply error:', err.response?.data || err.message);
    return "Yaar abhi mera dimagh thora hang ho gaya, dobara try karo 😅";
  }
}

module.exports = { getAIReply };
