const { cors } = require('./_zenoti');
exports.handler = async () => {
  const key = process.env.ZENOTI_API_KEY;
  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key_exists: !!key,
      key_length: key ? key.length : 0,
      key_preview: key ? key.substring(0, 8) + '...' : 'MISSING'
    })
  };
};
