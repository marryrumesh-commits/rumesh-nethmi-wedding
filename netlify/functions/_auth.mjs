export function adminAuthorized(event) {
  const expected = process.env.ADMIN_KEY || '';
  const supplied = event.headers?.['x-admin-key'] || event.headers?.['X-Admin-Key'] || '';
  return Boolean(expected && supplied && supplied === expected);
}

export function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    body: JSON.stringify(body)
  };
}
