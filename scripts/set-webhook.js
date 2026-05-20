/**
 * Run this script ONCE after deploying to Vercel to register the webhook.
 * Usage: BOT_TOKEN=your_token VERCEL_URL=https://your-project.vercel.app node scripts/set-webhook.js
 */

const https = require('https');

const token = process.env.BOT_TOKEN;
const vercelUrl = process.env.VERCEL_URL;

if (!token || !vercelUrl) {
  console.error('❌ Set BOT_TOKEN and VERCEL_URL environment variables first.');
  console.error('Example: BOT_TOKEN=xxx VERCEL_URL=https://your-project.vercel.app node scripts/set-webhook.js');
  process.exit(1);
}

const webhookUrl = `${vercelUrl}/webhook`;
const apiUrl = `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;

https.get(apiUrl, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    if (result.ok) {
      console.log(`✅ Webhook set successfully!`);
      console.log(`🔗 Webhook URL: ${webhookUrl}`);
    } else {
      console.error('❌ Failed to set webhook:', result.description);
    }
  });
}).on('error', err => {
  console.error('❌ Error:', err.message);
});
