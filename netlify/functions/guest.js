// GET  /api/guest?center_id=xxx&phone=xxx  — lookup guest by phone
// POST /api/guest  — create new guest
const { zenoti, ok, err, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  if (event.httpMethod === 'GET') {
    const { center_id, phone, email } = event.queryStringParameters || {};
    if (!center_id || (!phone && !email)) return err('center_id and phone or email required', 400);

    try {
      const cleanPhone = phone ? phone.replace(/\D/g, '').replace(/^1/, '') : null;
      let searchParam = cleanPhone ? `phone=${cleanPhone}` : `email=${encodeURIComponent(email)}`;
      const data = await zenoti(`/guests/search?center_id=${center_id}&${searchParam}`);
      const guests = data.guests || [];
      if (guests.length === 0) return ok({ found: false, guest: null });
      const g = guests[0];
      return ok({ found: true, guest: { id: g.id, first_name: g.personal_info?.first_name?.trim(), last_name: g.personal_info?.last_name?.trim(), email: g.personal_info?.email || '', phone: g.personal_info?.mobile_phone?.number || cleanPhone || '', loyalty_points: g.loyalty_points || 0 } });
    } catch (e) { return err('Failed to lookup guest', e.status || 500, e.body); }
  }

  if (event.httpMethod === 'POST') {
    let body;
    try { body = JSON.parse(event.body); } catch { return err('Invalid JSON', 400); }
    const { center_id, first_name, last_name, email, phone } = body;
    if (!center_id || !first_name || !last_name) return err('center_id, first_name, last_name required', 400);
    try {
      const cleanPhone = phone ? phone.replace(/\D/g, '').replace(/^1/, '') : '';
      const data = await zenoti('/guests', { method: 'POST', body: JSON.stringify({ center_id, personal_info: { first_name, last_name, email: email || '', mobile_phone: cleanPhone ? { country_code: 1, number: cleanPhone } : undefined } }) });
      return ok({ success: true, guest: { id: data.guest?.id || data.id, first_name, last_name, email: email || '', phone: cleanPhone, loyalty_points: 0 } }, 201);
    } catch (e) { return err('Failed to create guest', e.status || 500, e.body); }
  }


  if (event.httpMethod === 'PUT') {
    let body;
    try { body = JSON.parse(event.body); } catch { return err('Invalid JSON', 400); }
    const { center_id, guest_id, first_name, last_name, email } = body;
    if (!center_id || !guest_id) return err('center_id and guest_id required', 400);
    try {
      await zenoti(`/guests/${guest_id}`, { method: 'PUT', body: JSON.stringify({ center_id, personal_info: { first_name, last_name, email: email || '', mobile_phone: { country_code: 1 }, country_fk: { id: 233 } } }) });
      return ok({ success: true, guest: { id: guest_id, first_name, last_name, email: email || '' } });
    } catch (e) { return err('Failed to update guest', e.status || 500, e.body); }
  }

  return err('Method not allowed', 405);
};
