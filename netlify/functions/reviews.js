// GET /api/reviews
// Returns: { rating, total_reviews, reviews: [{ author, rating, text, time, photo_url }] }
const { corsFor, clientIp, checkRateLimit, rateLimitedResponse } = require('./_security');

const PLACE_ID = 'ChIJfwZPxy-6woARvKqv8TFGBBo';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

let cachedResponse = null;
let cachedAt = 0;

function ok(body, cors) {
  return { statusCode: 200, headers: { ...cors, 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

function fallback(cors) {
  return ok({ rating: 0, total_reviews: 0, reviews: [] }, cors);
}

exports.handler = async (event) => {
  const cors = corsFor(event, 'GET, OPTIONS');
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  // The 24h cache already absorbs normal traffic; this only stops someone
  // deliberately hammering the endpoint to burn the Google Places quota.
  const check = checkRateLimit(`reviews:${clientIp(event)}`, { max: 30, windowMs: 60_000 });
  if (!check.allowed) return rateLimitedResponse(cors, check.retryAfterSec);

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return fallback(cors);

  const now = Date.now();
  if (cachedResponse && (now - cachedAt) < CACHE_DURATION_MS) return ok(cachedResponse, cors);

  try {
    const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=reviews,rating,userRatingCount&key=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Google Places API error:', res.status, errorText);
      return ok({ rating: 0, total_reviews: 0, reviews: [], debug: { status: res.status, error: errorText } }, cors);
    }

    const data = await res.json();
    const reviews = (data.reviews || []).map((r) => ({
      author: r.authorAttribution ? r.authorAttribution.displayName : 'Anonymous',
      rating: r.rating || 5,
      text: r.text ? (r.text.text || r.text) : '',
      time: r.relativePublishTimeDescription || '',
      photo_url: r.authorAttribution ? r.authorAttribution.photoUri : '',
    }));

    const result = { rating: data.rating || 0, total_reviews: data.userRatingCount || 0, reviews };
    cachedResponse = result;
    cachedAt = now;
    return ok(result, cors);
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return ok({ rating: 0, total_reviews: 0, reviews: [], debug: { error: error.message } }, cors);
  }
};
