const { zenoti, ok, err, cors } = require('./_zenoti');

const CENTER_ID = 'eca2792d-2bbb-4789-be99-6a263c609925';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { service_id, date, guest_id } = event.queryStringParameters || {};
  if (!service_id || !date || !guest_id) return err('service_id, date, guest_id required', 400);

  const results = {};

  // Try v2 and different endpoint paths
  const attempts = [
    ['/v2/bookings', { center_id: CENTER_ID, services: [{ service_id, guest_id }] }],
    ['/bookings', { center_id: CENTER_ID, service_id, guest_id }],
    ['/bookings', { center_id: CENTER_ID, guests: [{ guest_id, services: [{ service_id }] }] }],
    ['/bookings', { center_id: CENTER_ID, booking_items: [{ service_id, guest_id }] }],
  ];

  for (const [path, payload] of attempts) {
    const label = `${path}::${Object.keys(payload).join(',')}`;
    try {
      const BASE = process.env.ZENOTI_API_URL || 'https://apiamrs12.zenoti.com/v1';
      const url = path.startsWith('/v2') 
        ? BASE.replace('/v1', '') + path 
        : BASE + path;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `apikey ${process.env.ZENOTI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 100) }; }
      results[label] = { success: res.ok, status: res.status, booking_id: data.booking_id || data.id, msg: data.message || data.Message, keys: Object.keys(data) };
    } catch (e) {
      results[label] = { error: e.message };
    }
  }

  return ok({ results });
};
