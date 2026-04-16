const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:16604';

function joinUrl(path) {
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
}

export async function request(path, options = {}) {
  const { headers: optionHeaders, ...requestOptions } = options;

  const response = await fetch(joinUrl(path), {
    cache: 'no-store',
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(optionHeaders || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const fallback = `Request failed (HTTP ${response.status})`;
    const message = typeof payload === 'string' ? payload : payload?.message || fallback;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return payload;
}
