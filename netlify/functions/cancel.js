// POST /api/cancel   body: { center_id, appointment_id, guest_id, comments? }   — the shape the app sends
// (legacy) PUT /api/cancel?invoice_id=&guest_id=&comments=   — kept for any other caller, now ALSO requires guest_id
//
// The previous version of this function cancelled by invoice_id alone, with
// no check that the invoice belonged to the guest asking — anyone who saw or
// guessed an invoice_id could cancel any customer's appointment. It also did
// not match what the app actually sends (POST with appointment_id, not PUT
// with invoice_id in the query string), so the app's cancel button most
// likely never worked against this endpoint.
//
// The fix is one lookup that does two jobs at once: resolve the caller's
// appointment_id/invoice_id against THAT GUEST's own appointment list before
// calling Zenoti's cancel. If it is not found there, the request is refused —
// guest_id is the same proof-of-identity this whole API already relies on
// (it is what /api/guest hands back after a phone lookup, and what every
// other endpoint here already trusts), so this makes cancel consistent with
// the rest of the API instead of leaving it as the one endpoint with no
// ownership check at all.
const { zenoti, ok, err } = require('./_zenoti');
const { corsFor, clientIp, checkRateLimit, rateLimitedResponse } = require('./_security');

const DAY_MS = 24 * 60 * 60 * 1000;

async function findOwnedInvoice({ centerId, guestId, appointmentId, invoiceId }) {
  const now = new Date();
  const start = new Date(now.getTime() - 60 * DAY_MS).toISOString().split('T')[0];
  const end = new Date(now.getTime() + 180 * DAY_MS).toISOString().split('T')[0];
  const data = await zenoti(`/appointments?center_id=${centerId}&guest_id=${guestId}&start_date=${start}&end_date=${end}`);
  const rows = Array.isArray(data) ? data : (data?.appointments || []);
  const match = rows.find(a =>
    (appointmentId && a.appointment_id === appointmentId) ||
    (invoiceId && a.invoice_id === invoiceId)
  );
  return match ? (match.invoice_id || null) : null;
}

exports.handler = async (event) => {
  const cors = corsFor(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  let centerId, appointmentId, invoiceId, guestId, comments;

  if (event.httpMethod === 'POST') {
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch { return err('Invalid JSON', 400, null, cors); }
    ({ center_id: centerId, appointment_id: appointmentId, invoice_id: invoiceId, guest_id: guestId, comments } = body);
  } else if (event.httpMethod === 'PUT') {
    const q = event.queryStringParameters || {};
    centerId = q.center_id; invoiceId = q.invoice_id; guestId = q.guest_id; comments = q.comments;
  } else {
    return err('Method not allowed', 405, null, cors);
  }

  if (!guestId) return err('guest_id is required — a cancellation must be tied to the guest it belongs to', 400, null, cors);
  if (!appointmentId && !invoiceId) return err('appointment_id or invoice_id required', 400, null, cors);
  if (!centerId) return err('center_id required', 400, null, cors);

  const check = checkRateLimit(`cancel:${clientIp(event)}:${guestId}`, { max: 10, windowMs: 3_600_000 });
  if (!check.allowed) return rateLimitedResponse(cors, check.retryAfterSec);

  try {
    const ownedInvoiceId = await findOwnedInvoice({ centerId, guestId, appointmentId, invoiceId });
    if (!ownedInvoiceId) return err('No matching appointment found for this guest', 403, null, cors);

    const url = `/invoices/${ownedInvoiceId}/cancel${comments ? `?comments=${encodeURIComponent(String(comments).slice(0, 300))}` : ''}`;
    const data = await zenoti(url, { method: 'PUT' });
    return ok({ success: true, ...data }, 200, cors);
  } catch (e) {
    return err('Failed to cancel appointment', e.status || 500, e.body, cors);
  }
};

module.exports._findOwnedInvoice = findOwnedInvoice; // exported for tests only
