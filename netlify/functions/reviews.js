// GET /api/reviews
// Returns: { rating, total_reviews, reviews: [{ author, rating, text, time, photo_url }] }

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const PLACE_ID = 'ChIJfwZPxy-6woARvKqv8TFGBBo';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Module-level cache
let cachedResponse = null;
let cachedAt = 0;

function ok(body) {
  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function fallback() {
  return ok({ rating: 0, total_reviews: 0, reviews: [] });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return fallback();
  }

  // Return cached response if still fresh
  const now = Date.now();
  if (cachedResponse && (now - cachedAt) < CACHE_DURATION_MS) {
    return ok(cachedResponse);
  }

  try {
    const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=reviews,rating,userRatingCount&key=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Google Places API error:', res.status, errorText);
      return ok({ rating: 0, total_reviews: 0, reviews: [], debug: { status: res.status, error: errorText } });
    }

    const data = await res.json();

    const reviews = (data.reviews || []).map((r) => ({
      author: r.authorAttribution ? r.authorAttribution.displayName : 'Anonymous',
      rating: r.rating || 5,
      text: r.text ? (r.text.text || r.text) : '',
      time: r.relativePublishTimeDescription || '',
      photo_url: r.authorAttribution ? r.authorAttribution.photoUri : '',
    }));

    const result = {
      rating: data.rating || 0,
      total_reviews: data.userRatingCount || 0,
      reviews,
    };

    // Cache the result
    cachedResponse = result;
    cachedAt = now;

    return ok(result);
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return ok({ rating: 0, total_reviews: 0, reviews: [], debug: { error: error.message } });
  }
};
