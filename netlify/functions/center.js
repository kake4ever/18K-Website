const { zenoti, ok, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const results = {};
  const endpoints = ['/centers', '/centers?size=10', '/organization/centers'];

  for (const ep of endpoints) {
    try {
      const data = await zenoti(ep);
      results[ep] = { success: true, data };
    } catch (e) {
      results[ep] = { success: false, status: e.status, error: e.body };
    }
  }

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({ debug: true, results })
  };
};
