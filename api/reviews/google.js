/**
 * Fetches reviews from Google Places API and normalizes them
 * to match the Hostaway review schema
 * 
 * Query Parameters:
 * - placeId: Google Place ID for the property (required)
 * 
 * Example: /api/reviews/google?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4
 */
import { normalizeGoogleReview } from "../../utils/reviewNormalizer.js";


/**
 * Normalizes a Google review to match Hostaway schema
 * @param {Object} googleReview - Raw Google review object
 * @param {string} propertyName - Name of the property
 * @returns {Object} Normalized review object
 */

/**
 * Fetches reviews from Google Places API
 * @param {string} placeId - Google Place ID
 * @param {string} apiKey - Google Places API key
 * @returns {Promise<Object>} API response with reviews
 */
async function fetchGoogleReviews(placeId, apiKey) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,reviews,rating,user_ratings_total&key=${apiKey}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Google API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Google API status: ${data.status} - ${data.error_message || 'Unknown error'}`);
  }

  return data.result;
}

/**
 * Main serverless function handler
 */
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: "error",
      error: 'Method not allowed'
    });
  }

  try {
    // Get Google Places API key from environment
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        status: "error",
        result: [],
        error: 'Google Places API key not configured',
        message: 'Please set GOOGLE_PLACES_API_KEY in environment variables'
      });
    }

    // Get placeId from query parameters
    const { placeId } = req.query;

    if (!placeId) {
      return res.status(400).json({
        status: "error",
        result: [],
        error: 'Missing required parameter',
        message: 'placeId query parameter is required'
      });
    }

    // Fetch reviews from Google Places API
    const placeDetails = await fetchGoogleReviews(placeId, apiKey);

    // Check if reviews exist
    if (!placeDetails.reviews || placeDetails.reviews.length === 0) {
      return res.status(200).json({
        status: "success",
        result: [],
        meta: {
          propertyName: placeDetails.name,
          totalRating: placeDetails.rating,
          totalReviews: placeDetails.user_ratings_total,
          message: 'No reviews found for this property'
        }
      });
    }

    // Normalize reviews to match Hostaway schema

    const normalizedReviews = placeDetails.reviews.map(review =>
        normalizeGoogleReview(review, { name: placeDetails.name })
    );
    

    // Return normalized reviews with metadata
    return res.status(200).json({
      status: "success",
      result: normalizedReviews,
      meta: {
        propertyName: placeDetails.name,
        totalRating: placeDetails.rating,
        totalReviews: placeDetails.user_ratings_total,
        reviewsReturned: normalizedReviews.length,
        source: 'Google Places API'
      }
    });

  } catch (error) {
    console.error('Error fetching Google reviews:', error);

    // Handle specific error types
    if (error.message.includes('INVALID_REQUEST')) {
      return res.status(400).json({
        status: "error",
        result: [],
        error: 'Invalid Place ID',
        message: 'The provided placeId is not valid'
      });
    }

    if (error.message.includes('OVER_QUERY_LIMIT')) {
      return res.status(429).json({
        status: "error",
        result: [],
        error: 'API quota exceeded',
        message: 'Google Places API quota exceeded. Please try again later.'
      });
    }

    return res.status(500).json({
      status: "error",
      result: [],
      error: 'Failed to fetch Google reviews',
      message: error.message
    });
  }
}
