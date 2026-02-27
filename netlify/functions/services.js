// GET /api/services?center_id=xxx
const { zenoti, ok, err, cors } = require('./_zenoti');

// Categories to show in the app, in display order
const CATEGORIES = [
  { id: '06e12679-f802-444e-b2d2-249e5e70fb81', name: 'Manicures' },
  { id: '51d4383f-8187-4df5-9769-39c5f2a07c30', name: 'Pedicure' },
  { id: '4fd3cada-8237-44a5-be99-4a145f6f52f4', name: '18K Signature Pedicure' },
  { id: '11f9400e-b76e-49fa-bfea-966cae2b263a', name: 'Premium Manicure' },
  { id: '88f8634d-5c12-48cf-8fd4-c18931622d75', name: 'Nail Enhancements' },
  { id: '64e0e015-b1e8-4d07-b8f0-ede7bd4a1950', name: 'Waxing' },
  { id: '48cce4f0-911e-49f8-af4f-c483c084fd1e', name: 'Goddess Package' },
  { id: 'ff8665d2-dc4d-4bc2-b84c-a6b75553a435', name: 'Queen Package' },
  { id: '2a8cbcbb-9e82-47b7-a7e1-d7381d27893c', name: 'Princess Package' },
];

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  const { center_id } = event.queryStringParameters || {};
  if (!center_id) return err('center_id required', 400);

  try {
    // Fetch all categories in parallel
    const results = await Promise.all(
      CATEGORIES.map(cat =>
        zenoti(`/centers/${center_id}/services?size=50&category_id=${cat.id}`)
          .then(data => ({ cat, services: data.services || [] }))
          .catch(() => ({ cat, services: [] }))
      )
    );

    const grouped = {};
    const services = [];

    results.forEach(({ cat, services: catServices }) => {
      if (catServices.length === 0) return;
      const mapped = catServices.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description || '',
        duration: s.duration || 0,
        price: s.price_info?.sale_price || s.price_info?.final_price || 0,
        category_id: cat.id,
        category_name: cat.name,
      }));
      grouped[cat.name] = mapped;
      services.push(...mapped);
    });

    return ok({ services, grouped });
  } catch (e) {
    return err('Failed to fetch services', e.status || 500, e.body);
  }
};
