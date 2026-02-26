const { ok, err, cors } = require('./_zenoti');

const CENTER_ID = 'eca2792d-2bbb-4789-be99-6a263c609925';
const BASE_URL = process.env.ZENOTI_API_URL || 'https://apiamrs12.zenoti.com/v1';
const CATALOG_URL = BASE_URL.replace('/v1', '');
const API_KEY = process.env.ZENOTI_API_KEY;
const APP_ID = process.env.ZENOTI_APP_ID;
const APP_SECRET = process.env.ZENOTI_APP_SECRET;

async function getBearerToken() {
  const res = await fetch(`${BASE_URL}/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ application_id: APP_ID, client_secret: APP_SECRET }),
  });
  const data = await res.json();
  return data.access_token || null;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { service_id, date } = event.queryStringParameters || {};
  if (!service_id || !date) return err('service_id, date required', 400);

  try {
    // Format date as "YYYY-MM-DD 00:00:00"
    const centerDate = `${date} 00:00:00`;

    // Get bearer token
    const token = await getBearerToken();
    if (!token) return err('Could not get auth token', 500);

    // Fetch available times using Catalog API
    const res = await fetch(`${CATALOG_URL}/api/Catalog/Appointments/Availabletimes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`,
        'Application_name': 'Webstore V2',
        'Application_version': '1.0.0',
      },
      body: JSON.stringify({
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
      }),
    });

    const data = await res.json();
    if (!res.ok) return err('Availabletimes failed', res.status, data);

    // Extract slots from response
    const slots = (data.slots || data.Slots || data.availableTimes || []).map(s => ({
      start_time: s.StartTime || s.start_time,
      end_time: s.EndTime || s.end_time,
      therapist_id: s.TherapistId || s.therapist_id || null,
      therapist_name: s.TherapistName || s.therapist_name || 'Any',
    }));

    return ok({ date, slots, count: slots.length, raw_keys: Object.keys(data) });
  } catch (e) {
    return err('Failed', 500, e.message);
  }
};
