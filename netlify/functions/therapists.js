const { ok, cors } = require('./_zenoti');

const TECHNICIANS = [
  { id: '7a31af0b-2ae4-4be9-9e9a-e0ea2b1e2b33', first_name: 'Thomas', last_name: '' },
  { id: '43fb2fb4-c9c6-41fa-8d7c-b0cbda0565bb', first_name: 'Kristin', last_name: '' },
  { id: 'e31fe3be-c44b-43ac-9a79-eb1e523f824a', first_name: 'Kenny', last_name: '' },
  { id: 'acc7dcba-c68e-458f-b3b7-73753b32944d', first_name: 'Kris', last_name: '' },
  { id: '01deba97-ed3c-433b-9c00-1194d65284f7', first_name: 'Chloe', last_name: '' },
  { id: 'd8e20fc3-fce0-4e7a-af9b-9de148dd4979', first_name: 'SuSu', last_name: '' },
  { id: '0125a4b5-fae4-4c88-8671-786f994fed2f', first_name: 'Tom', last_name: '' },
];

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  return ok({ therapists: TECHNICIANS.map(t => ({ ...t, name: t.last_name ? `${t.first_name} ${t.last_name}` : t.first_name, image_url: null })) });
};
