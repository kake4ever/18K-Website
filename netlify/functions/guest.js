// GET  /api/guest?center_id=xxx&phone=xxx  — lookup guest by phone
// POST /api/guest  — create new guest
const { zenoti, ok, err, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  // ── LOOKUP ──────────────────────────────────────────────
  if (event.httpMethod === 'GET') {
    const { center_id, phone, email } = event.queryStringParameters || {};
    if (!center_id || (!phone && !email)) return err('center_id and phone or email required', 400);

    try {
      // Strip non-digits from phone for comparison
      const cleanPhone = phone ? phone.replace(/\D/g, '').replace(/^1/, '') : null;

      // Search by phone or email
      let searchParam = '';
      if (phone) searchParam = `mobile=${encodeURIComponent(phone)}`;
      else searchParam = `email=${encodeURIComponent(email)}`;

      // Fetch up to 200 guests and filter client-side (Zenoti ignores mobile filter)
      const data = await zenoti(`/guests?center_id=${center_id}&${searchParam}&size=200`);
      const guests = data.guests || [];

      // Find matching guest by phone number
      let match = null;
      if (cleanPhone) {
        match = guests.find(g => {
          const gPhone = g.personal_info?.mobile_phone?.number?.replace(/\D/g, '').replace(/^1/, '');
          return gPhone === cleanPhone;
        });
      } else if (email) {
        match = guests.find(g =>
          g.personal_info?.email?.toLowerCase() === email.toLowerCase() ||
          g.personal_info?.user_name?.toLowerCase() === email.toLowerCase()
        );
      }

      if (!match) return ok({ found: false, guest: null });

      const g = match;
      return ok({
        found: true,
        guest: {
          id: g.id,
          first_name: g.personal_info?.first_name?.trim(),
          last_name: g.personal_info?.last_name?.trim(),
          email: g.personal_info?.email || g.personal_info?.user_name || '',
          phone: g.personal_info?.mobile_phone?.number || '',
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
      const cleanPhone = phone ? phone.replace(/\D/g, '').replace(/^1/, '') : '';
      const payload = {
        center_id,
        personal_info: {
          first_name,
          last_name,
          email: email || '',
          mobile_phone: phone ? { country_code: 1, number: cleanPhone } : undefined,
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
          email: email || '',
          phone: cleanPhone,
          loyalty_points: 0,
        },
      }, 201);
    } catch (e) {
      return err('Failed to create guest', e.status || 500, e.body);
    }
  }

  return err('Method not allowed', 405);
};
