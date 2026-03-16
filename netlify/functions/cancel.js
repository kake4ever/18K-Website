// PUT /api/cancel?invoice_id=xxx&comments=xxx
const { zenoti, ok, err, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { invoice_id, comments } = event.queryStringParameters || {};
  if (!invoice_id) return err('invoice_id required', 400);

  try {
    const url = `/invoices/${invoice_id}/cancel${comments ? `?comments=${encodeURIComponent(comments)}` : ''}`;
    const data = await zenoti(url, { method: 'PUT' });
    return ok(data);
  } catch (e) {
    return err('Failed to cancel appointment', e.status || 500, e.body);
  }
};
