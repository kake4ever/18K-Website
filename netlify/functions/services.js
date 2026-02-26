const { zenoti, ok, err, cors } = require('./_zenoti');

const CENTER_ID = 'eca2792d-2bbb-4789-be99-6a263c609925';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  try {
    const data = await zenoti(`/centers/${CENTER_ID}/services?size=200`);
    const services = (data.services || []).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      duration: s.duration,
      price: s.price?.sales_price || s.price?.actual_price || 0,
      category_id: s.category?.id,
      category_name: s.category?.name,
    }));

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
