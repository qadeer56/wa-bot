// Salam/hi/hello type messages detect karne ke liye
const GREETING_WORDS = [
  'salam', 'assalam', 'aslam', 'assalamualaikum', 'asalam',
  'hi', 'hello', 'hey', 'hyy', 'hii', 'hola',
];

// Funny/ego/meme style greeting replies - random se ek choose hoga
const GREETING_REPLIES = [
  '👋 Walaikum salam ji! Kya haal chaal, bore to nahi ho rahe? 😎',
  'Salam! Aaya bhi to jab mera mood off tha 🙄 khair batao kya scene hai',
  'Heyy! Kaise ho? Waise mujhe pata hai tum bas free ho isliye msg kiya 😏',
  'Wassup! Mera VIP customer aa gaya 👑 bolo kya chahiye',
  'Assalamualaikum! Thoda late reply karta hun jaan ke, attitude hai mera 😌',
];

function isGreeting(text) {
  const clean = text.toLowerCase().trim();
  return GREETING_WORDS.some((w) => clean === w || clean.startsWith(w + ' ') || clean.startsWith(w + ','));
}

function getGreetingReply() {
  return GREETING_REPLIES[Math.floor(Math.random() * GREETING_REPLIES.length)];
}

module.exports = { isGreeting, getGreetingReply };
