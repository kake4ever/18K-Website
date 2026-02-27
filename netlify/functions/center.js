// GET /api/center
// Returns center details including the center_id UUID
const { zenoti, ok, err, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  try {
    const data = await zenoti('/centers');
    const centers = data.centers || [];
    const center = centers.find(c =>
      c.code === process.env.ZENOTI_CENTER_CODE ||
      c.name?.includes('18K')
    ) || centers[0];

    if (!center) return err('Center not found', 404);

    return ok({
      id: center.id,
      name: center.display_name || center.name,
      code: center.code,
      address: center.contact?.address,
      phone: center.contact?.phone_1,
      email: center.contact?.email,
      hours: center.working_hours,
    });
  } catch (e) {
    return err('Failed to fetch center', e.status || 500, e.body);
  }
};
