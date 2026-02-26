const { zenoti, ok, err, cors } = require('./_zenoti');

const CENTER_ID = 'eca2792d-2bbb-4789-be99-6a263c609925';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { service_id, date } = event.queryStringParameters || {};
  if (!service_id || !date) return err('service_id, date required', 400);

  const results = {};

  const endpoints = [
    `/appointments/slots?center_id=${CENTER_ID}&service_id=${service_id}&date=${date}&size=50`,
    `/appointments/slots?center_id=${CENTER_ID}&date=${date}`,
    `/appointments/slots?center_id=${CENTER_ID}&service_id=${service_id}&start_date=${date}&end_date=${date}`,
    `/centers/${CENTER_ID}/appointments/slots?service_id=${service_id}&date=${date}`,
    `/appointments/availability?center_id=${CENTER_ID}&service_id=${service_id}&date=${date}`,
  ];

  for (const ep of endpoints) {
    try {
      const data = await zenoti(ep);
      results[ep] = { success: true, keys: Object.keys(data), sample: JSON.stringify(data).slice(0, 300) };
    } catch (e) {
      results[ep] = { success: false, status: e.status, msg: e.body?.message || e.body?.Message, detail: e.body };
    }
  }

  return ok({ results });
};
