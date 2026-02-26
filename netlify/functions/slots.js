const { zenoti, ok, err, cors } = require('./_zenoti');

const CENTER_ID = 'eca2792d-2bbb-4789-be99-6a263c609925';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { service_id, date } = event.queryStringParameters || {};
  if (!service_id || !date) return err('service_id, date required', 400);

  const results = {};

  // Try every possible slots/availability endpoint format
  const endpoints = [
    `/centers/${CENTER_ID}/slots?service_id=${service_id}&date=${date}`,
    `/centers/${CENTER_ID}/availability?service_id=${service_id}&date=${date}`,
    `/centers/${CENTER_ID}/services/${service_id}/slots?date=${date}`,
    `/centers/${CENTER_ID}/services/${service_id}/availability?date=${date}`,
    `/appointments/slots?center_id=${CENTER_ID}&service_id=${service_id}&date=${date}`,
  ];

  for (const ep of endpoints) {
    try {
      const data = await zenoti(ep);
      results[ep] = { success: true, keys: Object.keys(data), sample: JSON.stringify(data).slice(0, 200) };
    } catch (e) {
      results[ep] = { success: false, status: e.status, msg: e.body?.message || e.body?.Message };
    }
  }

  return ok({ results });
};
