const { zenoti, ok, err, cors } = require('./_zenoti');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  const { center_id } = event.queryStringParameters || {};
  if (!center_id) return err('center_id required', 400);
  try {
    const data = await zenoti(`/centers/${center_id}/therapists`);
    const therapists = (data.therapists || []).map(t => ({
      id: t.id,
      first_name: t.personal_info?.first_name?.trim() || '',
      last_name: t.personal_info?.last_name?.trim() || '',
      name: `${t.personal_info?.first_name?.trim() || ''} ${t.personal_info?.last_name?.trim() || ''}`.trim(),
      image_url: t.profile_image_url || null,
    }));
    return ok({ therapists });
  } catch (e) {
    return err('Failed to fetch therapists', e.status || 500, e.body);
  }
};
