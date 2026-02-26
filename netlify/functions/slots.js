const { zenoti, ok, err, cors } = require('./_zenoti');

const CENTER_ID = 'eca2792d-2bbb-4789-be99-6a263c609925';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { service_id, date, guest_id } = event.queryStringParameters || {};
  if (!service_id || !date || !guest_id) return err('service_id, date, guest_id required', 400);

  const [y, m, d] = date.split('-');
  const results = {};

  const dateFormats = {
    'iso':       date,                    // 2026-02-26
    'slash':     `${y}/${m}/${d}`,        // 2026/02/26
    'us_slash':  `${m}/${d}/${y}`,        // 02/26/2026
    'us_dash':   `${m}-${d}-${y}`,        // 02-26-2026
    'full_iso':  `${date}T00:00:00`,      // 2026-02-26T00:00:00
    'full_iso_z':`${date}T00:00:00.000Z`, // 2026-02-26T00:00:00.000Z
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
      results[label] = { center_date, booking_id, error: data.Error || null };
    } catch (e) {
      results[label] = { center_date, failed: true, msg: e.body?.message || e.body?.Message };
    }
  }

  return ok({ results });
};
