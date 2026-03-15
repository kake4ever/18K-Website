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
      const DEPOSITS = {
        'dc2874d0-a6e0-459b-a530-019aa40bd81e': 22.50,  // Gel Manicure
        'adb41db2-0d85-4929-be77-4a5fd995a0b6': 25.00,  // Gel Manicure with Removal
        '28a1b97e-254b-449c-a5c1-f5ac16a56dd6': 27.50,  // Dipping Powder Manicure
        'ccddb693-53d0-4b04-9448-3cfbb625ca14': 30.00,  // Dipping Powder with Removal
        'f8e85208-9fdd-4739-839d-9d85d583193f': 35.00,  // Gel-X
        '6dec0797-578f-4b34-9b1a-d43dea0c3162': 40.00,  // Gel-X with removal
        '56dbd438-cf1a-4d07-8289-f6d13d0766c4': 35.00,  // Hard Gel Fill
        '6fbaba58-96ac-49e0-8ae0-ed2551a29275': 40.00,  // Hard Gel Full Set
        '33f59dc6-0985-49e2-8c7b-4c9f61efc8db': 40.00,  // Dipping Powder Full Set
        'c2bfcbae-6ab4-4959-ae41-cb8cc419ac97': 35.00,  // Acrylic Fill In
        'e2a7ae07-8d82-43b3-9c15-b0a1d1dd0ad8': 40.00,  // Acrylic Full Set
        'a8df6ef7-a78c-46f5-882c-49ed4b1c46ea': 40.00,  // Acrylic Full Set with removal
        'ac7995a6-3846-4ae1-b6fe-dd5c0fe40bf1': 35.00,  // Gel Extensions
      };
      const mapped = catServices.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description || '',
        duration: s.duration || 0,
        price: s.price_info?.sale_price || s.price_info?.final_price || 0,
        category_id: cat.id,
        category_name: cat.name,
        deposit: DEPOSITS[s.id] || 0,
      }));
      grouped[cat.name] = mapped;
      services.push(...mapped);
    });

    return ok({ services, grouped });
  } catch (e) {
    return err('Failed to fetch services', e.status || 500, e.body);
  }
};
