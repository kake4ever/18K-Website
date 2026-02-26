const { ok, err, cors } = require('./_zenoti');

const CENTER_ID = 'eca2792d-2bbb-4789-be99-6a263c609925';
const BASE_URL = process.env.ZENOTI_API_URL || 'https://apiamrs12.zenoti.com/v1';
const CATALOG_URL = BASE_URL.replace('/v1', '');
const API_KEY = process.env.ZENOTI_API_KEY;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { service_id, date } = event.queryStringParameters || {};
  if (!service_id || !date) return err('service_id, date required', 400);

  const centerDate = `${date} 00:00:00`;
  const body = {
    CenterId: CENTER_ID,
    CenterDate: centerDate,
    CheckFutureDayAvailability: false,
    FromDeals: false,
    FromServiceFrequnecyFlow: true,
    SlotBookings: [{
      GuestId: null,
      AppointmentGroupId: null,
      Services: [{
        Service: { Id: service_id },
        RequestedTherapist: { Id: null },
        RequestedTherapistGender: 3,
        Room: null,
      }],
    }],
  };

  const results = {};

  // Try apikey auth on catalog endpoint
  const authHeaders = [
    { label: 'apikey_catalog', url: `${CATALOG_URL}/api/Catalog/Appointments/Availabletimes`, auth: `apikey ${API_KEY}` },
    { label: 'apikey_v1', url: `${BASE_URL}/appointments/availabletimes`, auth: `apikey ${API_KEY}` },
    { label: 'apikey_v1_catalog', url: `${BASE_URL}/Catalog/Appointments/Availabletimes`, auth: `apikey ${API_KEY}` },
  ];

  for (const { label, url, auth } of authHeaders) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': auth },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 200) }; }
      results[label] = { status: res.status, keys: Object.keys(data), sample: JSON.stringify(data).slice(0, 300) };
    } catch (e) {
      results[label] = { error: e.message };
    }
  }

  return ok({ results });
};
