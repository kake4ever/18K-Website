const { ok, err, cors } = require('./_zenoti');

const BASE_URL = process.env.ZENOTI_API_URL || 'https://apiamrs12.zenoti.com/v1';
const APP_ID = process.env.ZENOTI_APP_ID || '114454F6-BA15-4607-A88C-F7FAECD803AF';
const APP_SECRET = process.env.ZENOTI_APP_SECRET || '6821202124824cecaea36d1433907a6350c';
const CENTER_ID = process.env.ZENOTI_CENTER_ID || 'eca2792d-2bbb-4789-be99-6a263c609925';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors, body: '' };
  }

  try {
    const tokenRes = await fetch(`${BASE_URL}/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET }),
    });

    const tokenData = await tokenRes.json().catch(() => ({}));

    if (tokenData.access_token) {
      const testRes = await fetch(`${BASE_URL}/centers/${CENTER_ID}/services?size=5`, {
        headers: { 'Authorization': `bearer ${tokenData.access_token}`, 'Accept': 'application/json' },
      });
      const testData = await testRes.json().catch(() => ({}));
      return ok({ success: true, token_preview: tokenData.access_token.substring(0,30)+'...', services_test: { status: testRes.status, data: testData } });
    }

    return ok({ token_status: tokenRes.status, token_response: tokenData });

  } catch (e) {
    return err('Token generation failed', 500, e.message || String(e));
  }
};
