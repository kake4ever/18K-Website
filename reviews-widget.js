// Google Reviews Widget for 18K Nail Boutique
// Self-contained: fetches reviews, injects CSS, renders into #google-reviews
(function () {
  'use strict';

  var ROTATE_INTERVAL = 6000;
  var MAX_TEXT_LENGTH = 150;
  var GOOGLE_MAPS_URL = 'https://search.google.com/local/reviews?placeid=ChIJfwZPxy-6woARvKqv8TFGBBo';

  var container = document.getElementById('google-reviews');
  if (!container) return;

  // Inject styles
  var style = document.createElement('style');
  style.textContent = [
    '#google-reviews-widget { background: #1A1714; padding: clamp(5rem,10vw,8rem) 5%; text-align: center; position: relative; overflow: hidden; }',
    '#google-reviews-widget::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(to right, transparent, #B8964E, transparent); opacity: 0.15; }',
    '.gr-overline { font-size: 0.6rem; font-weight: 500; letter-spacing: 0.45em; text-transform: uppercase; color: #B8964E; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center; gap: 1rem; }',
    '.gr-title { font-family: "Cormorant Garamond", Georgia, serif; font-size: clamp(2rem,4vw,3.2rem); font-weight: 300; line-height: 1.2; color: #FDFBF8; margin-bottom: 0.5rem; letter-spacing: 0.02em; }',
    '.gr-title em { font-style: italic; color: #B8964E; }',
    '.gr-summary { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 3rem; flex-wrap: wrap; }',
    '.gr-summary-stars { font-size: 1.4rem; color: #D4BC8B; letter-spacing: 0.1em; }',
    '.gr-summary-rating { font-family: "Cormorant Garamond", Georgia, serif; font-size: 1.8rem; font-weight: 300; color: #FDFBF8; }',
    '.gr-summary-count { font-size: 0.75rem; font-weight: 300; color: rgba(255,255,255,0.35); letter-spacing: 0.05em; }',
    '.gr-summary-google { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.68rem; font-weight: 400; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.4); text-decoration: none; transition: color 0.3s; }',
    '.gr-summary-google:hover { color: #D4BC8B; }',
    '.gr-carousel { position: relative; max-width: 700px; margin: 0 auto; min-height: 200px; }',
    '.gr-review { position: absolute; top: 0; left: 0; right: 0; opacity: 0; transform: translateY(12px); transition: opacity 0.5s ease, transform 0.5s ease; pointer-events: none; }',
    '.gr-review.active { opacity: 1; transform: translateY(0); pointer-events: auto; position: relative; }',
    '.gr-review-stars { font-size: 1.1rem; color: #D4BC8B; letter-spacing: 0.15em; margin-bottom: 1.2rem; }',
    '.gr-review-text { font-family: "Cormorant Garamond", Georgia, serif; font-size: clamp(1.1rem,2vw,1.5rem); font-weight: 300; font-style: italic; line-height: 1.65; color: rgba(255,255,255,0.75); margin-bottom: 1.5rem; }',
    '.gr-review-text a { color: #D4BC8B; text-decoration: none; font-style: normal; font-size: 0.85em; }',
    '.gr-review-text a:hover { text-decoration: underline; }',
    '.gr-review-author { display: flex; align-items: center; justify-content: center; gap: 0.8rem; }',
    '.gr-review-photo { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(184,150,78,0.3); }',
    '.gr-review-name { font-size: 0.68rem; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; color: #B8964E; }',
    '.gr-review-time { font-size: 0.65rem; font-weight: 300; color: rgba(255,255,255,0.25); letter-spacing: 0.05em; }',
    '.gr-dots { display: flex; justify-content: center; gap: 0.5rem; margin-top: 2rem; }',
    '.gr-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.15); cursor: pointer; transition: all 0.3s; border: none; padding: 0; }',
    '.gr-dot.active { background: #B8964E; width: 22px; border-radius: 3px; }',
    '.gr-cta { margin-top: 2.5rem; }',
    '.gr-cta a { display: inline-block; font-family: "Outfit", sans-serif; font-size: 0.65rem; font-weight: 400; letter-spacing: 0.2em; text-transform: uppercase; padding: 1rem 2.5rem; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.45); background: transparent; text-decoration: none; transition: all 0.3s; }',
    '.gr-cta a:hover { border-color: #D4BC8B; color: #D4BC8B; }',
  ].join('\n');
  document.head.appendChild(style);

  function buildStars(rating) {
    var full = Math.floor(rating);
    var half = rating - full >= 0.5 ? 1 : 0;
    var empty = 5 - full - half;
    var s = '';
    for (var i = 0; i < full; i++) s += '★';
    if (half) s += '★';
    for (var j = 0; j < empty; j++) s += '☆';
    return s;
  }

  function truncateText(text, max) {
    if (!text || text.length <= max) return text;
    var truncated = text.substring(0, max);
    var lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > max * 0.6) truncated = truncated.substring(0, lastSpace);
    return truncated + '...';
  }

  function render(data) {
    if (!data || !data.reviews || data.reviews.length === 0) return;

    var reviews = data.reviews;
    var currentIndex = 0;
    var timer = null;

    var html = '<div id="google-reviews-widget">';
    html += '<div class="gr-overline">What Our Clients Say</div>';
    html += '<h2 class="gr-title">Real Reviews, <em>Real Results</em></h2>';

    // Summary line
    html += '<div class="gr-summary">';
    if (data.rating) {
      html += '<span class="gr-summary-rating">' + data.rating.toFixed(1) + '</span>';
      html += '<span class="gr-summary-stars">' + buildStars(data.rating) + '</span>';
    }
    if (data.total_reviews) {
      html += '<span class="gr-summary-count">(' + data.total_reviews.toLocaleString() + ' reviews)</span>';
    }
    html += '<a href="' + GOOGLE_MAPS_URL + '" target="_blank" rel="noopener" class="gr-summary-google">View on Google</a>';
    html += '</div>';

    // Carousel
    html += '<div class="gr-carousel">';
    reviews.forEach(function (review, i) {
      var reviewText = review.text || '';
      var truncated = truncateText(reviewText, MAX_TEXT_LENGTH);
      var needsMore = reviewText.length > MAX_TEXT_LENGTH;

      html += '<div class="gr-review' + (i === 0 ? ' active' : '') + '" data-index="' + i + '">';
      html += '<div class="gr-review-stars">' + buildStars(review.rating) + '</div>';
      html += '<p class="gr-review-text">“' + truncated;
      if (needsMore) {
        html += ' <a href="' + GOOGLE_MAPS_URL + '" target="_blank" rel="noopener">Read more</a>';
      }
      html += '”</p>';
      html += '<div class="gr-review-author">';
      if (review.photo_url) {
        html += '<img class="gr-review-photo" src="' + review.photo_url + '" alt="" loading="lazy">';
      }
      html += '<span class="gr-review-name">' + (review.author || 'Anonymous') + '</span>';
      if (review.time) {
        html += '<span class="gr-review-time">· ' + review.time + '</span>';
      }
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';

    // Dots
    if (reviews.length > 1) {
      html += '<div class="gr-dots">';
      reviews.forEach(function (_, i) {
        html += '<button class="gr-dot' + (i === 0 ? ' active' : '') + '" data-dot="' + i + '" aria-label="Show review ' + (i + 1) + '"></button>';
      });
      html += '</div>';
    }

    // CTA
    html += '<div class="gr-cta"><a href="' + GOOGLE_MAPS_URL + '" target="_blank" rel="noopener">See All Google Reviews</a></div>';

    html += '</div>';
    container.innerHTML = html;

    // Carousel logic
    if (reviews.length <= 1) return;

    var reviewEls = container.querySelectorAll('.gr-review');
    var dotEls = container.querySelectorAll('.gr-dot');

    function showReview(index) {
      currentIndex = index;
      for (var i = 0; i < reviewEls.length; i++) {
        reviewEls[i].classList.toggle('active', i === index);
      }
      for (var j = 0; j < dotEls.length; j++) {
        dotEls[j].classList.toggle('active', j === index);
      }
    }

    function next() {
      showReview((currentIndex + 1) % reviews.length);
    }

    function startTimer() {
      stopTimer();
      timer = setInterval(next, ROTATE_INTERVAL);
    }

    function stopTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    // Dot click handlers
    dotEls.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showReview(parseInt(dot.getAttribute('data-dot'), 10));
        startTimer(); // Reset timer on manual navigation
      });
    });

    startTimer();
  }

  // Fetch reviews
  fetch('/api/reviews')
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      render(data);
    })
    .catch(function () {
      // Silently fail — existing static testimonials remain visible
    });
})();
