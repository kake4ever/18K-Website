// GET  /api/guest?center_id=xxx&phone=xxx  — lookup guest by phone
// POST /api/guest  — create new guest
// Body: { center_id, first_name, last_name, email, phone }
const { zenoti, ok, err, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  // ── LOOKUP ──────────────────────────────────────────────
  if (event.httpMethod === 'GET') {
    const { center_id, phone, email } = event.queryStringParameters || {};
    if (!center_id || (!phone && !email)) return err('center_id and phone or email required', 400);

    try {
      const query = phone
        ? `mobile=${encodeURIComponent(phone)}`
        : `email=${encodeURIComponent(email)}`;
      const data = await zenoti(`/guests?center_id=${center_id}&${query}`);
      const guests = data.guests || [];

      if (guests.length === 0) return ok({ found: false, guest: null });

      const g = guests[0];
      return ok({
        found: true,
        guest: {
          id: g.id,
          first_name: g.personal_info?.first_name,
          last_name: g.personal_info?.last_name,
          email: g.personal_info?.email,
          phone: g.personal_info?.mobile_phone?.number,
          loyalty_points: g.loyalty_points || 0,
        },
      });
    } catch (e) {
      return err('Failed to lookup guest', e.status || 500, e.body);
    }
  }

  // ── CREATE ───────────────────────────────────────────────
  if (event.httpMethod === 'POST') {
    let body;
    try { body = JSON.parse(event.body); } catch { return err('Invalid JSON', 400); }

    const { center_id, first_name, last_name, email, phone } = body;
    if (!center_id || !first_name || !last_name) return err('center_id, first_name, last_name required', 400);

    try {
      const payload = {
        center_id,
        personal_info: {
          first_name,
          last_name,
          email,
          mobile_phone: { country_code: 1, number: phone },
        },
      };

      const data = await zenoti('/guests', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return ok({
        success: true,
        guest: {
          id: data.guest?.id || data.id,
          first_name,
          last_name,
          email,
          phone,
          loyalty_points: 0,
        },
      }, 201);
    } catch (e) {
      return err('Failed to create guest', e.status || 500, e.body);
    }
  }

  return err('Method not allowed', 405);
};
