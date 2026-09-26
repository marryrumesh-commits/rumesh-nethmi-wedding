import { getStore } from '@netlify/blobs';
import { json } from '../lib/http.mjs';

const store = getStore('rumesh-nethmi-wedding');
const KEY = 'rsvps';

async function getRsvps() {
  return (await store.get(KEY, { type: 'json' })) || [];
}

export default async (request) => {
  try {
    if (request.method === 'GET') {
      return json(200, { rsvps: await getRsvps() });
    }
    if (request.method !== 'POST') return json(405, { error: 'Method not allowed.' });

    let data;
    try {
      data = await request.json();
    } catch {
      return json(400, { error: 'Invalid JSON.' });
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return json(400, { error: 'Invalid RSVP data.' });
    }

    const guestName = String(data.guestName || 'Guest').trim().slice(0, 160) || 'Guest';
    const attendance = data.attendance === 'Accepted' ? 'Accepted' : data.attendance === 'Declined' ? 'Declined' : '';
    if (!attendance) return json(400, { error: 'Please select attendance.' });
    const requestedCount = Number(data.count || 1);
    const count = attendance === 'Accepted'
      ? (Number.isFinite(requestedCount) ? Math.min(10, Math.max(1, Math.trunc(requestedCount))) : 1)
      : 0;
    const message = String(data.message || '').trim().slice(0, 1000);
    const row = { id: crypto.randomUUID(), guestName, attendance, count, message, time: new Date().toISOString() };
    const rows = await getRsvps();
    rows.unshift(row);
    await store.setJSON(KEY, rows);
    return json(201, { ok: true, rsvp: row });
  } catch (error) {
    console.error('Failed to save RSVP:', error);
    return json(500, { error: 'Unable to save RSVP.' });
  }
};
