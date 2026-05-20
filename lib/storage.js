/**
 * Storage module.
 * Uses Vercel KV (Redis) if available, otherwise in-memory (for local dev).
 *
 * To enable persistent storage on Vercel:
 * Vercel Dashboard → Storage → Create KV Database → Link to project
 */

const memoryStore = new Set();
const USERS_KEY = 'bot:users';

async function getKV() {
  try {
    return require('@vercel/kv');
  } catch {
    return null;
  }
}

async function getUsers() {
  const kv = await getKV();
  if (kv) {
    try {
      const users = await kv.smembers(USERS_KEY);
      return users || [];
    } catch {
      return [...memoryStore];
    }
  }
  return [...memoryStore];
}

async function saveUser(chatId) {
  const id = chatId.toString();
  const kv = await getKV();
  if (kv) {
    try { await kv.sadd(USERS_KEY, id); return; } catch {}
  }
  memoryStore.add(id);
}

async function deleteUser(chatId) {
  const id = chatId.toString();
  try {
    const kv = await getKV();
    if (kv) {
      await kv.srem(USERS_KEY, id);
    } else {
      memoryStore.delete(id);
    }
    return true;
  } catch {
    return false;
  }
}

async function addUser(chatId) {
  const id = chatId.toString();
  try {
    const kv = await getKV();
    if (kv) {
      const exists = await kv.sismember(USERS_KEY, id);
      if (exists) return false;
      await kv.sadd(USERS_KEY, id);
    } else {
      if (memoryStore.has(id)) return false;
      memoryStore.add(id);
    }
    return true;
  } catch {
    return false;
  }
}

module.exports = { getUsers, saveUser, deleteUser, addUser };
