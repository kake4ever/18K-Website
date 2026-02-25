const { zenoti, ok, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const CENTER_ID = 'eca2792d-2bbb-4789-be99-6a263c609925';
  const results = {};

  const endpoints = [
    `/centers/${CENTER_ID}/services`,
    `/centers/${CENTER_ID}/services?size=10`,
    `/centers/${CENTER_ID}/catalog/services`,
    `/catalog/services?center_id=${CENTER_ID}`,
    `/centers/${CENTER_ID}/services?catalog_enabled=true`,
  ];

  for (const ep of endpoints) {
    try {
      const data = await zenoti(ep);
      results[ep] = { success: true, count: data.services?.length, sample: data.services?.[0]?.name };
    } catch (e) {
      results[ep] = { success: false, status: e.status, code: e.body?.ErrorCode || e.body?.code, msg: e.body?.Message || e.body?.message };
    }
  }

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({ results })
  };
};
