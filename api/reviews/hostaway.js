import { normalizeReviews } from '../../utils/reviewNormalizer.js';

const MOCK_REVIEWS_RAW = [
  {
    id: 7453,
    type: "guest-to-host",
    status: "published",
    rating: 9.5,
    publicReview: "Amazing stay! The apartment was spotless and exactly as described. Location is perfect for exploring the city.",
    reviewCategory: [
      { category: "cleanliness", rating: 10 },
      { category: "communication", rating: 9 },
      { category: "location", rating: 10 },
      { category: "value", rating: 9 }
    ],
    submittedAt: "2024-12-10 14:30:00",
    guestName: "Sarah Johnson",
    listingName: "2B N1 A - 29 Shoreditch Heights",
    channel: "Airbnb"
  },
  {
    id: 7454,
    type: "guest-to-host",
    status: "published",
    rating: 8.5,
    publicReview: "Great property overall. Very clean and modern. Only minor issue was the WiFi speed could be better.",
    reviewCategory: [
      { category: "cleanliness", rating: 10 },
      { category: "communication", rating: 8 },
      { category: "amenities", rating: 7 },
      { category: "value", rating: 9 }
    ],
    submittedAt: "2024-12-08 09:15:00",
    guestName: "Michael Chen",
    listingName: "Studio S2 - 15 Camden Lock",
    channel: "Booking.com"
  },
  {
    id: 7455,
    type: "guest-to-host",
    status: "published",
    rating: 10,
    publicReview: "Exceptional experience! The host was incredibly responsive and helpful. The apartment exceeded all expectations.",
    reviewCategory: [
      { category: "cleanliness", rating: 10 },
      { category: "communication", rating: 10 },
      { category: "location", rating: 10 },
      { category: "value", rating: 10 }
    ],
    submittedAt: "2024-12-05 18:45:00",
    guestName: "Emma Williams",
    listingName: "2B N1 A - 29 Shoreditch Heights",
    channel: "Airbnb"
  },
  {
    id: 7456,
    type: "guest-to-host",
    status: "published",
    rating: 7.0,
    publicReview: "Decent stay but had some noise issues from neighbors. Property itself was nice and clean.",
    reviewCategory: [
      { category: "cleanliness", rating: 9 },
      { category: "communication", rating: 7 },
      { category: "location", rating: 8 },
      { category: "value", rating: 6 }
    ],
    submittedAt: "2024-12-03 11:20:00",
    guestName: "David Brown",
    listingName: "1B W1 - 42 Westminster View",
    channel: "Vrbo"
  },
  {
    id: 7457,
    type: "guest-to-host",
    status: "published",
    rating: 9.0,
    publicReview: "Lovely apartment in a great neighborhood. Everything was as advertised. Would definitely stay again!",
    reviewCategory: [
      { category: "cleanliness", rating: 9 },
      { category: "communication", rating: 9 },
      { category: "location", rating: 10 },
      { category: "value", rating: 8 }
    ],
    submittedAt: "2024-11-30 16:00:00",
    guestName: "Lisa Anderson",
    listingName: "Studio S2 - 15 Camden Lock",
    channel: "Airbnb"
  },
  {
    id: 7458,
    type: "guest-to-host",
    status: "published",
    rating: 8.0,
    publicReview: "Good location and clean space. Check-in process was smooth. Would recommend for short stays.",
    reviewCategory: [
      { category: "cleanliness", rating: 8 },
      { category: "communication", rating: 8 },
      { category: "location", rating: 9 },
      { category: "value", rating: 7 }
    ],
    submittedAt: "2024-11-28 13:30:00",
    guestName: "James Wilson",
    listingName: "2B N1 A - 29 Shoreditch Heights",
    channel: "Booking.com"
  }
];

/**
 * Fetches access token from Hostaway API
 * Note: Only useful if you want to fetch real data
 */
async function getHostawayToken() {
  const authData = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.HOSTAWAY_CLIENT_ID,
    client_secret: process.env.HOSTAWAY_CLIENT_SECRET,
    scope: "general"
  });

  const response = await fetch("https://api.hostaway.com/v1/accessTokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache"
    },
    body: authData.toString()
  });

  const result = await response.json();
  return result.access_token;
}

/**
 * Vercel Serverless Function Handler
 * Endpoint: /api/reviews/hostaway
 */
export default async function handler(req, res) {
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      status: "error",
      error: 'Method not allowed' 
    });
  }

  try {

    let normalizedReviews = [];
    let source = 'mock';
    let apiUsed = false;
    /*
    Dear Recruiter, Kindly note below:
    I tested the Hostaway API, there are no reviews for the provided API credentials,
    so I'm returning mock data instead. You can uncomment the code below to fetch real data
    if you have reviews in your Hostaway account.
    */

    // rawReviews = MOCK_REVIEWS_RAW;
    // const normalizedReviews = rawReviews.map(normalizeHostawayReview);

    /*
    // Uncomment this block to fetch from real Hostaway API
    try {
      const token = await getHostawayToken();
      const response = await fetch("https://api.hostaway.com/v1/reviews", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Cache-Control": "no-cache"
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.result && data.result.length > 0) {
          normalizedReviews = normalizeReviews(data.result, 'hostaway');
          source = 'hostaway_api';
          apiUsed = true;
        }
      }
    } catch (apiError) {
      console.error('Error fetching from Hostaway API, using mock data:', apiError);
      // Falls back to mock data
    }
    */

    // Fall back to mock data if API not used or failed
    if (!apiUsed || normalizedReviews.length === 0) {
      normalizedReviews = normalizeReviews(MOCK_REVIEWS_RAW, 'mock');
      source = 'mock';
    }

    return res.status(200).json({
      status: "success",
      result: normalizedReviews,
      meta: {
        count: normalizedReviews.length,
        source: source,
        normalized: true,
        timeStamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in serverless function:', error);
    return res.status(500).json({
      status: "error",
      result: [],
      error: 'Failed to fetch reviews',
      message: error.message
    });
  }
}