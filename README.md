# Telegram Bot — Vercel Webhook Setup

## Folder Structure

```
telegram-bot-vercel/
├── api/
│   └── webhook.js          ← Vercel serverless function (webhook entry point)
├── lib/
│   ├── bot.js              ← Bot logic (commands, callbacks)
│   └── storage.js          ← User storage (Vercel KV / Redis)
├── scripts/
│   ├── set-webhook.js      ← Register webhook with Telegram
│   └── delete-webhook.js   ← Remove webhook from Telegram
├── .env.example            ← Environment variables template
├── .gitignore
├── package.json
└── vercel.json             ← Vercel configuration
```

---

## Step-by-Step Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your `BOT_TOKEN` and `ADMIN_ID`.

### 3. Deploy to Vercel
```bash
npx vercel deploy --prod
```
Note your deployment URL (e.g. `https://your-project.vercel.app`)

### 4. Add Vercel KV (Storage)
- Go to Vercel Dashboard → your project → **Storage** tab
- Create a **KV** database and link it to your project
- Vercel will automatically add the KV env variables

### 5. Set Environment Variables on Vercel
In Vercel Dashboard → Settings → Environment Variables, add:
- `BOT_TOKEN` = your bot token
- `ADMIN_ID` = your Telegram user ID

### 6. Register Webhook with Telegram
```bash
BOT_TOKEN=your_token VERCEL_URL=https://your-project.vercel.app node scripts/set-webhook.js
```

### Done!
Your bot is now live. Every message/callback goes to:
`https://your-project.vercel.app/webhook`

---

## Local Testing
```bash
npx vercel dev
```
Use [ngrok](https://ngrok.com/) to expose localhost and test webhooks locally.
