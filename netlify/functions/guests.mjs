import { getStore } from '@netlify/blobs';
import { json } from '../lib/http.mjs';

const store = getStore('rumesh-nethmi-wedding');
const KEY = 'guests';

async function getGuests() {
  return (await store.get(KEY, { type: 'json' })) || [];
}

export default async (request) => {
  try {
    if (request.method === 'GET') return json(200, { guests: await getGuests() });
    if (request.method === 'POST' || request.method === 'DELETE') {
      let data;
      try {
        data = await request.json();
      } catch {
        return json(400, { error: 'Invalid JSON.' });
      }
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return json(400, { error: 'Invalid request data.' });
      }

      if (request.method === 'POST') {
        const name = String(data.name || '').trim();
        if (!name) return json(400, { error: 'Guest name is required.' });
        const guests = await getGuests();
        if (!guests.some(g => g.name.toLowerCase() === name.toLowerCase())) {
          guests.push({ id: crypto.randomUUID(), name, createdAt: new Date().toISOString() });
          await store.setJSON(KEY, guests);
        }
        return json(200, { guests });
      }

      const guests = await getGuests();
      const filtered = guests.filter(g => g.id !== data.id);
      await store.setJSON(KEY, filtered);
      return json(200, { guests: filtered });
    }
    return json(405, { error: 'Method not allowed.' });
  } catch (error) {
    console.error('Failed to access guest storage:', error);
    return json(500, { error: 'Unable to access guest storage.' });
  }
};
