// Simple in-memory state (bot restart hone par reset ho jayega)
// Chaho to isko fs se json file mein save bhi kar sakte ho persistence ke liye
const autochatState = new Map(); // chatId -> true/false

function isAutochatOn(chatId) {
  return autochatState.get(chatId) === true;
}

function setAutochat(chatId, value) {
  autochatState.set(chatId, value);
}

module.exports = { isAutochatOn, setAutochat };
