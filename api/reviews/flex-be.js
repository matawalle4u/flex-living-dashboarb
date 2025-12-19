// require('dotenv').config();
// const express = require('express');

import dotenv from 'dotenv';
import express from 'express';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3009;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

const HOSTAWAY_CLIENT_ID = process.env.HOSTAWAY_CLIENT_ID;
const HOSTAWAY_CLIENT_SECRET = process.env.HOSTAWAY_CLIENT_SECRET;

const MOCK_REVIEWS = [
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


export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    return res.status(200).json({
      status: "success",
      result: MOCK_REVIEWS
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      result: [],
      error: 'Failed to fetch reviews',
      message: error.message
    });
  }
}

// NB: Recruiter, this func is only useful  if we want to fetch real data with the creds you sent to my email.
async function getHostawayToken() {
  const authData = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: HOSTAWAY_CLIENT_ID,
    client_secret: HOSTAWAY_CLIENT_SECRET,
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

app.get('/', (req, res) => {
  res.json({
    message: 'Flex Living Reviews API',
    endpoints: {
      health: '/health',
      reviews: '/api/reviews/hostaway',
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Flex Living API is running' });
});


app.get('/api/reviews/hostaway', async (req, res) => {
  try {
    
    
    /*
    Dear Recruiter, Kindly note below:
    I tested the hostway API, there is no reviews for the provided API credentials,
    so I decided to return mock data instead, you can uncomment the fetch code below to get real data if you have reviews in your Hostaway account 
    
    */

    /*
    try{

        const token = await getHostawayToken();
        const response = await fetch("https://api.hostaway.com/v1/reviews", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Cache-Control": "no-cache"
        }
        });

        if (!response.ok) {
        throw new Error(`Hostaway API error: ${response.status}`);
        }

        const data = await response.json();
        
        const normalizedReviews = (data.result || []).map(review => ({
        id: review.id,
        type: "guest-to-host",
        status: review.status || "published",
        rating: review.rating || 0,
        publicReview: review.reply || review.comment || "",
        reviewCategory: review.reviewCategoryScores || [],
        submittedAt: review.createdAt || new Date().toISOString(),
        guestName: review.guestName || "Anonymous",
        listingName: review.listingMapName || review.listingName || "Unknown Property",
        channel: review.channelName || "Hostaway"
        }));

        res.json({
        status: "success",
        result: normalizedReviews
        });

    } catch(apiError){
      console.error('Error fetching from Hostaway API, returning mock data instead:', apiError);
    }
    */

    /*
    Since there are no reviews in the Hostaway account for the provided credentials,
    returning mock review data defined above. You may comment this block and uncomment the fetch code above to get real data if available.
    */
    const normalizedReviews = MOCK_REVIEWS;

    res.json({
      status: "success",
      result: normalizedReviews
    });
    
    

  } catch (error) {
    console.error('Error fetching Hostaway reviews:', error);
    res.status(500).json({
      status: "error",
      result: [],
      error: 'Failed to fetch reviews from Hostaway',
      message: error.message
    });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Access reviews at: http://localhost:${PORT}/api/reviews/hostaway`);
});