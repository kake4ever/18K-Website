const { zenoti, ok, err, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { guest_id } = event.queryStringParameters || {};
  if (!guest_id) return err('guest_id required', 400);

  try {
    const data = await zenoti(`/guests/${guest_id}/points`);
    return ok(data.guest_points);
  } catch (e) {
    return err('Failed to fetch loyalty points', e.status || 500, e.body);
  }
};
