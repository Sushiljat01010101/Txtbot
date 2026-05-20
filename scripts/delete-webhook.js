/**
 * Run this script to remove the webhook from Telegram.
 * Usage: BOT_TOKEN=your_token node scripts/delete-webhook.js
 */

const https = require('https');

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('❌ Set BOT_TOKEN environment variable first.');
  process.exit(1);
}

const apiUrl = `https://api.telegram.org/bot${token}/deleteWebhook`;

https.get(apiUrl, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    if (result.ok) {
      console.log('✅ Webhook deleted successfully!');
    } else {
      console.error('❌ Failed to delete webhook:', result.description);
    }
  });
}).on('error', err => {
  console.error('❌ Error:', err.message);
});
