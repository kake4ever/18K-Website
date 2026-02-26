const { zenoti, ok, err, cors } = require('./_zenoti');

const CENTER_ID = 'eca2792d-2bbb-4789-be99-6a263c609925';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { service_id, date, guest_id } = event.queryStringParameters || {};
  if (!service_id || !date || !guest_id) return err('service_id, date, guest_id required', 400);

  const results = {};

  // Try different date formats
  const dateFormats = {
    'iso': date,                          // 2026-02-26
    'slash': date.replace(/-/g, '/'),     // 2026/02/26
    'us': date.split('-').reverse().join('/'), // 26/02/2026 -- wait that's wrong
    'mdY': (() => { const [y,m,d] = date.split('-'); return `${m}/${d}/${y}`; })(), // 02/26/2026
    'timestamp': new Date(date).toISOString(), // full ISO
    'dateonly': new Date(date).toISOString().split('T')[0], // same as iso
  };

  for (const [label, center_date] of Object.entries(dateFormats)) {
    try {
      const data = await zenoti('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          center_id: CENTER_ID,
          center_date,
          guests: [{ guest_id, services: [{ service_id }] }],
        }),
      });
      const booking_id = data.booking_id || data.id;
      const hasError = data.Error || data.error;
      results[label] = { center_date, booking_id, error: hasError };
    } catch (e) {
      results[label] = { center_date, failed: true, msg: e.body?.message || e.body?.Message };
    }
  }

  return ok({ results });
};
