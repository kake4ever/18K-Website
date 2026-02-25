const { ok, cors } = require('./_zenoti');

// Hardcoded since guest-type API keys can't list centers
// Center ID will be discovered via services endpoint
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  
  return ok({
    id: process.env.ZENOTI_CENTER_ID || 'pending',
    name: '18K Nail Boutique',
    code: '18K Nail',
    address: '1323 Lincoln Blvd, Santa Monica, CA 90401',
    phone: '424-238-5500',
    email: '18knailboutique@gmail.com',
  });
};
