const { ok, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  return ok({
    id: 'eca2792d-2bbb-4789-be99-6a263c609925',
    name: '18K Nail Boutique',
    code: '18K Nail',
    address: '1323 Lincoln Blvd, Santa Monica, CA 90401',
    phone: '424-238-5500',
    email: '18knailboutique@gmail.com',
  });
};
