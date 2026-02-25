// GET /api/services?center_id=xxx
// Returns full service catalog grouped by category
const { zenoti, ok, err, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { center_id } = event.queryStringParameters || {};
  if (!center_id) return err('center_id required', 400);

  try {
    const data = await zenoti(`/centers/${center_id}/services?size=200`);
    const services = (data.services || []).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      duration: s.duration,
      price: s.price?.sales_price || s.price?.actual_price || 0,
      category_id: s.category?.id,
      category_name: s.category?.name,
    }));

    // Group by category
    const grouped = {};
    services.forEach(s => {
      const cat = s.category_name || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s);
    });

    return ok({ services, grouped });
  } catch (e) {
    return err('Failed to fetch services', e.status || 500, e.body);
  }
};
