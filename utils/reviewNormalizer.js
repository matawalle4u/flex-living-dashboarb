/**
 * Normalizes review data from different sources to a common format
 */

// Default values for normalization
const DEFAULTS = {
  type: "guest-to-host",
  status: "published",
  rating: 0,
  guestName: "Anonymous",
  listingName: "Unknown Property",
  channel: "Unknown",
  publicReview: ""
};

/**
 * Normalize Hostaway API review data
 * @param {Object} review - Raw review from Hostaway API
 * @returns {Object} Normalized review
 */
export function normalizeHostawayReview(review) {
  if (!review || typeof review !== 'object') {
    return createDefaultReview();
  }
  
  return {
    id: review.id || generateId(),
    type: review.type || DEFAULTS.type,
    status: review.status || DEFAULTS.status,
    rating: parseFloat(review.rating) || DEFAULTS.rating,
    publicReview: review.reply || review.comment || review.publicReview || DEFAULTS.publicReview,
    reviewCategory: normalizeReviewCategories(review.reviewCategoryScores || review.reviewCategory || []),
    submittedAt: normalizeDate(review.createdAt || review.submittedAt),
    guestName: review.guestName || DEFAULTS.guestName,
    listingName: review.listingMapName || review.listingName || DEFAULTS.listingName,
    channel: review.channelName || review.channel || DEFAULTS.channel,
    rawSource: 'hostaway', // Keep track of original source
    originalData: review // Optional: keep original for reference
  };
}

/**
 * Normalize Google Places API review data
 * @param {Object} review - Raw review from Google Places API
 * @param {Object} placeInfo - Additional place information
 * @returns {Object} Normalized review
 */
export function normalizeGoogleReview(review, placeInfo = {}) {
  if (!review || typeof review !== 'object') {
    return createDefaultReview();
  }
  
  return {
    id: `google_${review.time || review.reviewId || generateId()}`,
    type: "guest-to-host",
    status: "published",
    rating: parseFloat(review.rating) * 2 || DEFAULTS.rating, // Convert 5-star to 10-point scale
    publicReview: review.text || review.comment || DEFAULTS.publicReview,
    reviewCategory: [], // Google doesn't provide category breakdown
    submittedAt: normalizeDate(review.time ? new Date(review.time * 1000).toISOString() : review.createTime),
    guestName: review.author_name || review.reviewer?.displayName || DEFAULTS.guestName,
    listingName: placeInfo.name || DEFAULTS.listingName,
    channel: "Google",
    rawSource: 'google',
    profilePhoto: review.profile_photo_url,
    relativeTime: review.relative_time_description,
    originalData: review
  };
}

/**
 * Normalize mock review data
 * @param {Object} review - Raw mock review
 * @returns {Object} Normalized review
 */
export function normalizeMockReview(review) {
  if (!review || typeof review !== 'object') {
    return createDefaultReview();
  }
  
  return {
    id: review.id || generateId(),
    type: review.type || DEFAULTS.type,
    status: review.status || DEFAULTS.status,
    rating: parseFloat(review.rating) || DEFAULTS.rating,
    publicReview: review.publicReview || DEFAULTS.publicReview,
    reviewCategory: normalizeReviewCategories(review.reviewCategory || []),
    submittedAt: normalizeDate(review.submittedAt),
    guestName: review.guestName || DEFAULTS.guestName,
    listingName: review.listingName || DEFAULTS.listingName,
    channel: review.channel || DEFAULTS.channel,
    rawSource: 'mock',
    originalData: review
  };
}

/**
 * Universal normalizer that detects source and applies appropriate normalization
 * @param {Object} review - Raw review from any source
 * @param {string} source - Optional source hint ('hostaway', 'google', 'mock', 'auto')
 * @returns {Object} Normalized review
 */
export function normalizeReview(review, source = 'auto') {
  if (!review || typeof review !== 'object') {
    return createDefaultReview();
  }
  
  // Auto-detect source if not specified
  if (source === 'auto') {
    if (review.channelName || review.listingMapName) {
      source = 'hostaway';
    } else if (review.author_name || review.profile_photo_url) {
      source = 'google';
    } else if (review.rawSource) {
      source = review.rawSource;
    } else {
      source = 'mock';
    }
  }
  
  switch (source) {
    case 'hostaway':
      return normalizeHostawayReview(review);
    case 'google':
      return normalizeGoogleReview(review);
    case 'mock':
      return normalizeMockReview(review);
    default:
      return normalizeMockReview(review);
  }
}

/**
 * Normalize an array of reviews
 * @param {Array} reviews - Array of raw reviews
 * @param {string} source - Source type
 * @returns {Array} Array of normalized reviews
 */
export function normalizeReviews(reviews = [], source = 'auto') {
  if (!Array.isArray(reviews)) {
    return [];
  }
  
  return reviews
    .map(review => normalizeReview(review, source))
    .filter(review => review !== null);
}

/**
 * Normalize review categories to consistent format
 * @param {Array} categories - Raw categories array
 * @returns {Array} Normalized categories
 */
function normalizeReviewCategories(categories = []) {
  if (!Array.isArray(categories)) {
    return [];
  }
  
  return categories
    .filter(cat => cat && typeof cat === 'object')
    .map(cat => ({
      category: String(cat.category || cat.name || '').toLowerCase().trim(),
      rating: parseFloat(cat.rating || cat.score || 0)
    }))
    .filter(cat => cat.category && !isNaN(cat.rating));
}

/**
 * Normalize date to ISO string
 * @param {string|Date|number} date - Input date
 * @returns {string} ISO date string
 */
function normalizeDate(date) {
  try {
    if (!date) {
      return new Date().toISOString();
    }
    
    if (typeof date === 'string' && date.includes('T')) {
      return new Date(date).toISOString();
    }
    
    if (typeof date === 'string') {
      // Try parsing various date formats
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
    
    if (typeof date === 'number') {
      return new Date(date).toISOString();
    }
    
    if (date instanceof Date) {
      return date.toISOString();
    }
    
    return new Date().toISOString();
  } catch (error) {
    console.warn('Date normalization error:', error);
    return new Date().toISOString();
  }
}

/**
 * Generate a unique ID for reviews
 * @returns {string} Unique ID
 */
function generateId() {
  return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a default review object
 * @returns {Object} Default review structure
 */
function createDefaultReview() {
  return {
    id: generateId(),
    type: DEFAULTS.type,
    status: DEFAULTS.status,
    rating: DEFAULTS.rating,
    publicReview: DEFAULTS.publicReview,
    reviewCategory: [],
    submittedAt: new Date().toISOString(),
    guestName: DEFAULTS.guestName,
    listingName: DEFAULTS.listingName,
    channel: DEFAULTS.channel,
    rawSource: 'unknown'
  };
}

/**
 * Validate if an object is a normalized review
 * @param {Object} review - Review to validate
 * @returns {boolean} True if valid normalized review
 */
export function isValidNormalizedReview(review) {
  if (!review || typeof review !== 'object') {
    return false;
  }
  
  const requiredFields = ['id', 'rating', 'publicReview', 'guestName', 'listingName', 'channel'];
  return requiredFields.every(field => review[field] !== undefined);
}

// Export defaults for easy access
export const reviewDefaults = DEFAULTS;