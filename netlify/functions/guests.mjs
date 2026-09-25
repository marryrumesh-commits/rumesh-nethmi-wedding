import { getStore } from '@netlify/blobs';
import { adminAuthorized, json } from './_auth.mjs';

const store = getStore('rumesh-nethmi-wedding');
const KEY = 'guests';

async function getGuests() {
  return (await store.get(KEY, { type: 'json' })) || [];
}

export default async (event) => {
  if (!adminAuthorized(event)) return json(401, { error: 'Unauthorized' });
  try {
    if (event.httpMethod === 'GET') return json(200, { guests: await getGuests() });
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');
      const name = String(data.name || '').trim();
      if (!name) return json(400, { error: 'Guest name is required.' });
      const guests = await getGuests();
      if (!guests.some(g => g.name.toLowerCase() === name.toLowerCase())) {
        guests.push({ id: crypto.randomUUID(), name, createdAt: new Date().toISOString() });
        await store.setJSON(KEY, guests);
      }
      return json(200, { guests });
    }
    if (event.httpMethod === 'DELETE') {
      const data = JSON.parse(event.body || '{}');
      const guests = await getGuests();
      const filtered = guests.filter(g => g.id !== data.id);
      await store.setJSON(KEY, filtered);
      return json(200, { guests: filtered });
    }
    return json(405, { error: 'Method not allowed.' });
  } catch (error) {
    console.error(error);
    return json(500, { error: 'Unable to access guest storage.' });
  }
};
