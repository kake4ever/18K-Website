const { ok, err, cors } = require('./_zenoti');

const BASE_URL = process.env.ZENOTI_API_URL || 'https://apiamrs12.zenoti.com/v1';
const CATALOG_URL = BASE_URL.replace('/v1', '');
const APP_ID = process.env.ZENOTI_APP_ID;
const APP_SECRET = process.env.ZENOTI_APP_SECRET;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  // Debug token generation
  const attempts = {};

  const payloads = [
    { application_id: APP_ID, client_secret: APP_SECRET },
    { app_id: APP_ID, app_secret: APP_SECRET },
    { application_id: APP_ID, client_secret: APP_SECRET, grant_type: 'client_credentials' },
  ];

  for (const [i, body] of payloads.entries()) {
    for (const url of [`${BASE_URL}/tokens`, `${CATALOG_URL}/api/tokens`, `${CATALOG_URL}/v1/tokens`]) {
      const label = `p${i}::${url.split('/').pop()}::${Object.keys(body).join(',')}`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const text = await res.text();
        let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 100) }; }
        attempts[label] = { status: res.status, keys: Object.keys(data), token: data.access_token ? 'GOT_TOKEN' : null, data };
      } catch (e) {
        attempts[label] = { error: e.message };
      }
    }
  }

  return ok({ app_id_set: !!APP_ID, app_secret_set: !!APP_SECRET, attempts });
};
