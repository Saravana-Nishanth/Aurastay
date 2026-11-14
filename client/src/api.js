// One place for every HTTP call the app makes. Errors are normalised so
// callers can rely on err.status and err.data (the server sends
// { errors: { field: message } } when validation fails).

async function handle(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function queryString(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) qs.set(key, value);
  });
  const text = qs.toString();
  return text ? `?${text}` : '';
}

export const hotelsApi = {
  list: (filters) => fetch(`/api/hotels${queryString(filters)}`).then(handle),
  get: (id) => fetch(`/api/hotels/${id}`).then(handle),
  create: (formData) => fetch('/api/hotels', { method: 'POST', body: formData }).then(handle),
  update: (id, formData) => fetch(`/api/hotels/${id}`, { method: 'PUT', body: formData }).then(handle),
  remove: (id) => fetch(`/api/hotels/${id}`, { method: 'DELETE' }).then(handle),
};
