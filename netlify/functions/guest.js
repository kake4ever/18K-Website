// GET  /api/guest?center_id=xxx&phone=xxx|email=xxx  — find a guest (rate-limited: a phone number is the
//                                                       only proof of identity a caller has before they
//                                                       have a guest_id, so this is the one lookup nobody
//                                                       can be asked to prove ownership of in advance)
// POST /api/guest   — create a new guest
// PUT  /api/guest   — update a guest (the app treats guest_id as sufficient proof of "this is my record" —
//                     the same model the rest of this API uses; a stronger identity check (e.g. an SMS
//                     code) is a real improvement but a bigger feature, not attempted in this pass)
const { zenoti, ok, err } = require('./_zenoti');
const { corsFor, clientIp, checkRateLimit, rateLimitedResponse } = require('./_security');

exports.handler = async (event) => {
  const cors = corsFor(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  const ip = clientIp(event);

  if (event.httpMethod === 'GET') {
    const { center_id, phone, email } = event.queryStringParameters || {};
    if (!center_id || (!phone && !email)) return err('center_id and phone or email required', 400, null, cors);

    const cleanPhone = phone ? phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '') : null;
    if (phone && !(cleanPhone && cleanPhone.length === 10)) return err('phone must be 10 US digits', 400, null, cors);

    // Two independent limits: overall traffic per IP, and lookups of one
    // specific phone/email — the second is what actually slows down someone
    // trying to harvest a single target's record by hitting it repeatedly.
    const ipCheck = checkRateLimit(`guest-search-ip:${ip}`, { max: 20, windowMs: 60_000 });
    if (!ipCheck.allowed) return rateLimitedResponse(cors, ipCheck.retryAfterSec);
    const targetKey = cleanPhone || email.toLowerCase();
    const targetCheck = checkRateLimit(`guest-search-target:${targetKey}`, { max: 10, windowMs: 3_600_000 });
    if (!targetCheck.allowed) return rateLimitedResponse(cors, targetCheck.retryAfterSec);

    try {
      const searchParam = cleanPhone ? `phone=${cleanPhone}` : `email=${encodeURIComponent(email)}`;
      const data = await zenoti(`/guests/search?center_id=${center_id}&${searchParam}`);
      const guests = data.guests || [];
      if (guests.length === 0) return ok({ found: false, guest: null }, 200, cors);
      const g = guests[0];
      const fullGuest = await zenoti(`/guests/${g.id}?center_id=${center_id}&expand=referral`);
      const referralCode = fullGuest?.referral?.referral_code || '';
      return ok({ found: true, guest: { id: g.id, code: g.code || '', referral_code: referralCode, first_name: g.personal_info?.first_name?.trim(), last_name: g.personal_info?.last_name?.trim(), email: g.personal_info?.email || '', phone: g.personal_info?.mobile_phone?.number || cleanPhone || '', loyalty_points: g.loyalty_points || 0 } }, 200, cors);
    } catch (e) { return err('Failed to lookup guest', e.status || 500, e.body, cors); }
  }

  if (event.httpMethod === 'POST') {
    const createCheck = checkRateLimit(`guest-create-ip:${ip}`, { max: 10, windowMs: 3_600_000 });
    if (!createCheck.allowed) return rateLimitedResponse(cors, createCheck.retryAfterSec);

    let body;
    try { body = JSON.parse(event.body); } catch { return err('Invalid JSON', 400, null, cors); }
    const { center_id, first_name, last_name, email, phone } = body;
    if (!center_id || !first_name || !last_name) return err('center_id, first_name, last_name required', 400, null, cors);
    const cleanPhone = phone ? phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '') : '';
    if (phone && cleanPhone.length !== 10) return err('phone must be 10 US digits', 400, null, cors);
    try {
      const data = await zenoti('/guests', { method: 'POST', body: JSON.stringify({ center_id, personal_info: { first_name, last_name, email: email || '', mobile_phone: cleanPhone ? { country_code: 1, number: cleanPhone } : undefined } }) });
      return ok({ success: true, guest: { id: data.guest?.id || data.id, first_name, last_name, email: email || '', phone: cleanPhone, loyalty_points: 0 } }, 201, cors);
    } catch (e) { return err('Failed to create guest', e.status || 500, e.body, cors); }
  }

  if (event.httpMethod === 'PUT') {
    let body;
    try { body = JSON.parse(event.body); } catch { return err('Invalid JSON', 400, null, cors); }
    const { center_id, guest_id, first_name, last_name, email, phone, code } = body;
    if (!center_id || !guest_id) return err('center_id and guest_id required', 400, null, cors);

    const updateCheck = checkRateLimit(`guest-update:${guest_id}`, { max: 10, windowMs: 3_600_000 });
    if (!updateCheck.allowed) return rateLimitedResponse(cors, updateCheck.retryAfterSec);

    try {
      const payload = {
        id: guest_id,
        code: code || '',
        center_id,
        is_online_booking_blocked: false,
        personal_info: {
          user_name: phone || '',
          first_name: first_name || '',
          last_name: last_name || '',
          email: email || '',
          mobile_phone: { country_code: 1, number: phone || '' },
          gender: -1,
          nationality_id: 225,
        },
        address_info: { country_id: 225 },
      };
      await zenoti(`/guests/${guest_id}`, { method: 'PUT', body: JSON.stringify(payload) });
      return ok({ success: true, guest: { id: guest_id, first_name, last_name, email: email || '' } }, 200, cors);
    } catch (e) { return err('Failed to update guest', e.status || 500, e.body, cors); }
  }

  return err('Method not allowed', 405, null, cors);
};
