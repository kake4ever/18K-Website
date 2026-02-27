// GET /api/services?center_id=xxx
const { zenoti, ok, err, cors } = require('./_zenoti');

// Map category IDs to names using the categories we already know
const CATEGORY_MAP = {
  '06e12679-f802-444e-b2d2-249e5e70fb81': 'Manicures',
  '51d4383f-8187-4df5-9769-39c5f2a07c30': 'Pedicure',
  '4fd3cada-8237-44a5-be99-4a145f6f52f4': '18K Signature Pedicure',
  '11f9400e-b76e-49fa-bfea-966cae2b263a': 'Premium Manicure',
  '88f8634d-5c12-48cf-8fd4-c18931622d75': 'Nail Enhancements',
  '64e0e015-b1e8-4d07-b8f0-ede7bd4a1950': 'Waxing',
  '48cce4f0-911e-49f8-af4f-c483c084fd1e': 'Goddess Package',
  'ff8665d2-dc4d-4bc2-b84c-a6b75553a435': 'Queen Package',
  '2a8cbcbb-9e82-47b7-a7e1-d7381d27893c': 'Princess Package',
  '3c6f5e7f-b489-4b5c-8de0-6650e5d183c0': 'Aesthetician',
  'f6616d84-cc65-4392-8651-828d33ed641c': 'Spa Facials',
};

const CAT_ORDER = [
  'Manicures',
  'Pedicure',
  '18K Signature Pedicure',
  'Premium Manicure',
  'Nail Enhancements',
  'Waxing',
  'Goddess Package',
  'Queen Package',
  'Princess Package',
];

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { center_id } = event.queryStringParameters || {};
  if (!center_id) return err('center_id required', 400);

  try {
    // Fetch services and categories in parallel
    const [svcData, catData] = await Promise.all([
      zenoti(`/centers/${center_id}/services?size=200`),
      zenoti(`/centers/${center_id}/categories?size=50`),
    ]);

    // Build category ID -> name map from live data
    const catMap = { ...CATEGORY_MAP };
    (catData.categories || []).forEach(c => { catMap[c.id] = c.name; });

    const services = (svcData.services || []).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description || '',
      duration: s.duration || 0,
      price: s.price_info?.sale_price || s.price_info?.final_price || 0,
      category_id: s.category?.id || '',
      category_name: catMap[s.category?.id] || s.category?.name || 'Other',
    }));

    // Group by category, preserving order
    const grouped = {};
    // Add ordered categories first
    CAT_ORDER.forEach(cat => { grouped[cat] = []; });

    services.forEach(s => {
      const cat = s.category_name;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s);
    });

    // Remove empty categories
    Object.keys(grouped).forEach(k => {
      if (grouped[k].length === 0) delete grouped[k];
    });

    return ok({ services, grouped });
  } catch (e) {
    return err('Failed to fetch services', e.status || 500, e.body);
  }
};
