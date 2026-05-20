const TelegramBot = require('node-telegram-bot-api');
const { handleUpdate } = require('../lib/bot');

const token = process.env.BOT_TOKEN;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(200).send('Webhook is active!');
  }

  try {
    const bot = new TelegramBot(token);
    const update = req.body;
    await handleUpdate(bot, update);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
};
