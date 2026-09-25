import { getStore } from '@netlify/blobs';
import { adminAuthorized, json } from './_auth.mjs';

const store = getStore('rumesh-nethmi-wedding');
const KEY = 'rsvps';

async function getRsvps() {
  return (await store.get(KEY, { type: 'json' })) || [];
}

export default async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      if (!adminAuthorized(event)) return json(401, { error: 'Unauthorized' });
      return json(200, { rsvps: await getRsvps() });
    }
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });

    const data = JSON.parse(event.body || '{}');
    const guestName = String(data.guestName || 'Guest').trim().slice(0, 160) || 'Guest';
    const attendance = data.attendance === 'Accepted' ? 'Accepted' : data.attendance === 'Declined' ? 'Declined' : '';
    if (!attendance) return json(400, { error: 'Please select attendance.' });
    const count = attendance === 'Accepted' ? Math.min(10, Math.max(1, Number(data.count || 1))) : 0;
    const message = String(data.message || '').trim().slice(0, 1000);
    const row = { id: crypto.randomUUID(), guestName, attendance, count, message, time: new Date().toISOString() };
    const rows = await getRsvps();
    rows.unshift(row);
    await store.setJSON(KEY, rows);
    return json(201, { ok: true, rsvp: row });
  } catch (error) {
    console.error(error);
    return json(500, { error: 'Unable to save RSVP.' });
  }
};
