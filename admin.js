const $ = id => document.getElementById(id);
let guestRows = [], responseRows = [];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

async function api(path, options = {}) {
  const headers = { 'content-type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

async function load() {
  try {
    const [g, r] = await Promise.all([api('/api/guests'), api('/api/rsvps')]);
    guestRows = g.guests || [];
    responseRows = r.rsvps || [];
    render();
  } catch (error) {
    alert(error.message);
  }
}

function render() {
  const accepted = responseRows.filter(x => x.attendance === 'Accepted');
  const declined = responseRows.filter(x => x.attendance === 'Declined');
  $('total').textContent = guestRows.length;
  $('accepted').textContent = accepted.length;
  $('declined').textContent = declined.length;
  $('people').textContent = accepted.reduce((n, x) => n + Number(x.count || 0), 0);
  $('guestList').innerHTML = guestRows.length ? guestRows.map(g => {
    const url = new URL('index.html', location.href);
    url.searchParams.set('name', g.name);
    return `<div class="guest"><div><div class="guest-name">${esc(g.name)}</div><div class="guest-link">${esc(url.href)}</div></div><button data-url="${esc(url.href)}" class="copy">Copy invitation link</button></div>`;
  }).join('') : '<p style="font-size:10px;color:#81766b">No invitees added yet.</p>';
  $('responses').innerHTML = responseRows.length ? responseRows.map(x =>
    `<tr><td>${esc(x.guestName)}</td><td>${esc(x.attendance)}</td><td>${Number(x.count || 0)}</td><td>${esc(x.message || '—')}</td><td>${new Date(x.time).toLocaleString()}</td></tr>`
  ).join('') : '<tr><td colspan="5">No RSVP responses yet.</td></tr>';
}

$('guestForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = $('name').value.trim();
  if (!name) return;
  try {
    const data = await api('/api/guests', { method: 'POST', body: JSON.stringify({ name }) });
    guestRows = data.guests || [];
    $('name').value = '';
    render();
  } catch (error) {
    alert(error.message);
  }
});

document.addEventListener('click', async e => {
  if (!e.target.classList.contains('copy')) return;
  const url = e.target.dataset.url;
  try {
    await navigator.clipboard.writeText(url);
    e.target.textContent = 'Copied ✓';
    setTimeout(() => e.target.textContent = 'Copy invitation link', 1400);
  } catch {
    prompt('Copy this invitation link:', url);
  }
});

$('refresh').addEventListener('click', load);
$('export').addEventListener('click', () => {
  const csv = 'Guest,Status,Count,Message,Time\n' + responseRows.map(x =>
    [x.guestName, x.attendance, x.count, x.message, new Date(x.time).toLocaleString()]
      .map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')
  ).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = 'rumesh-nethmi-rsvp.csv';
  a.click();
  URL.revokeObjectURL(a.href);
});

load();