const { ok, cors } = require('./_zenoti');

const TECHNICIANS = [
  { id: '7a31af0b-2ae4-4be9-9e9a-e0ea2b1e2b33', first_name: 'Bao', last_name: 'Pham' },
  { id: '43fb2fb4-c9c6-41fa-8d7c-b0cbda0565bb', first_name: 'Kristin', last_name: 'Le' },
  { id: 'acc7dcba-c68e-458f-b3b7-73753b32944d', first_name: 'Phuoc', last_name: 'Nguyen' },
  { id: '01deba97-ed3c-433b-9c00-1194d65284f7', first_name: 'Quynh', last_name: 'Nguyen' },
  { id: 'd8e20fc3-fce0-4e7a-af9b-9de148dd4979', first_name: 'Su', last_name: 'Nguyen' },
  { id: '0125a4b5-fae4-4c88-8671-786f994fed2f', first_name: 'Tom', last_name: 'Ly' },
];

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  return ok({ therapists: TECHNICIANS.map(t => ({ ...t, name: `${t.first_name} ${t.last_name}`, image_url: null })) });
};
