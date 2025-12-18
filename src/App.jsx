import React, { useState, useEffect } from 'react';
import { Star, Filter, TrendingUp, Building2, Calendar, MessageSquare, Check, X, Eye } from 'lucide-react';

const fetchHostawayReviews = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/reviews/hostaway');
    if (!response.ok) throw new Error('Backend API error');
    return await response.json();
  } catch (error) {
    console.error('Error fetching from API, using fallback data:', error);
    return {
      status: "success",
      result: [
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
      ]
    };
  }
};

const FlexLivingDashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [selectedReviews, setSelectedReviews] = useState(new Set());
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchHostawayReviews();
      setReviews(data.result);
      const autoSelect = new Set(
        data.result.filter(r => r.rating >= 9).map(r => r.id)
      );
      setSelectedReviews(autoSelect);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
    setLoading(false);
  };

  const toggleReviewSelection = (reviewId) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(reviewId)) {
      newSelected.delete(reviewId);
    } else {
      newSelected.add(reviewId);
    }
    setSelectedReviews(newSelected);
  };

  const properties = [...new Set(reviews.map(r => r.listingName))];
  const channels = [...new Set(reviews.map(r => r.channel))];

  const filteredReviews = reviews.filter(review => {
    if (filterProperty !== 'all' && review.listingName !== filterProperty) return false;
    if (filterChannel !== 'all' && review.channel !== filterChannel) return false;
    if (filterRating !== 'all') {
      const rating = parseFloat(filterRating);
      if (review.rating < rating) return false;
    }
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    } else if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    return 0;
  });

  const getPropertyStats = (propertyName) => {
    const propertyReviews = reviews.filter(r => r.listingName === propertyName);
    const avgRating = propertyReviews.reduce((sum, r) => sum + r.rating, 0) / propertyReviews.length;
    return {
      count: propertyReviews.length,
      avgRating: avgRating.toFixed(1),
      selected: propertyReviews.filter(r => selectedReviews.has(r.id)).length
    };
  };

  const getCategoryAverage = (reviews, category) => {
    const ratings = reviews
      .flatMap(r => r.reviewCategory)
      .filter(c => c.category === category)
      .map(c => c.rating);
    if (ratings.length === 0) return 0;
    return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'public') {
    const publicReviews = reviews.filter(r => selectedReviews.has(r.id));
    return (
      <div className="min-h-screen bg-white">
        <div style={{ backgroundColor: '#2D5F5D' }} className="text-white py-4 px-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xl font-light">the flex.</span>
            </div>
            <button
              onClick={() => setViewMode('dashboard')}
              style={{ backgroundColor: '#1a3f3e' }}
              className="px-4 py-2 rounded hover:opacity-90 transition text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-light mb-4" style={{ color: '#1F2937' }}>
              2B N1 A - 29 Shoreditch Heights
            </h1>
            <p className="text-lg text-gray-600 font-light">
              Modern 2-bedroom apartment in the heart of Shoreditch
            </p>
          </div>

          <div className="mb-16">
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
              <img 
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=675&fit=crop" 
                alt="Property" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop" 
                  alt="Room" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop" 
                  alt="Kitchen" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=300&fit=crop" 
                  alt="Bathroom" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop" 
                  alt="Living area" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-16">
            <h2 className="text-3xl md:text-4xl font-light mb-12" style={{ color: '#1F2937' }}>
              Guest Reviews
            </h2>

            {publicReviews.length === 0 ? (
              <p className="text-gray-500 italic">No reviews available yet.</p>
            ) : (
              <div className="space-y-8">
                {publicReviews.map((review, index) => (
                  <div key={review.id} className={`pb-8 ${index !== publicReviews.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-medium text-lg" style={{ color: '#1F2937' }}>
                          {review.guestName}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(review.submittedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ backgroundColor: '#E8F4F3', color: '#2D5F5D' }}>
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-semibold text-sm">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed italic" style={{ fontSize: '1.05rem' }}>
                      "{review.publicReview}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <footer style={{ backgroundColor: '#2D5F5D' }} className="text-white py-12 mt-20">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-lg font-light">the flex.</span>
            </div>
            <p className="text-sm opacity-75">© 2024 The Flex. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold" style={{ color: '#1F2937' }}>
                Reviews Dashboard
              </h1>
              <p className="text-gray-600 text-sm">Manage and monitor property reviews</p>
            </div>
            <button
              onClick={() => setViewMode('public')}
              className="flex items-center gap-2 px-5 py-2 text-white rounded-lg hover:opacity-90 transition"
              style={{ backgroundColor: '#2D5F5D' }}
            >
              <Eye className="w-4 h-4" />
              Preview Public View
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Reviews</span>
              <MessageSquare className="w-5 h-5" style={{ color: '#2D5F5D' }} />
            </div>
            <p className="text-3xl font-bold" style={{ color: '#1F2937' }}>{reviews.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Average Rating</span>
              <Star className="w-5 h-5 text-amber-500 fill-current" />
            </div>
            <p className="text-3xl font-bold" style={{ color: '#1F2937' }}>
              {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Properties</span>
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold" style={{ color: '#1F2937' }}>{properties.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Public Reviews</span>
              <Eye className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold" style={{ color: '#1F2937' }}>{selectedReviews.size}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: '#1F2937' }}>
            <TrendingUp className="w-5 h-5" style={{ color: '#2D5F5D' }} />
            Property Performance
          </h2>
          <div className="space-y-4">
            {properties.map(property => {
              const stats = getPropertyStats(property);
              const propertyReviews = reviews.filter(r => r.listingName === property);
              return (
                <div key={property} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: '#1F2937' }}>{property}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {stats.count} reviews • {stats.selected} public
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: '#E8F4F3', color: '#2D5F5D' }}>
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold">{stats.avgRating}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Cleanliness</p>
                      <p className="font-semibold text-lg" style={{ color: '#1F2937' }}>
                        {getCategoryAverage(propertyReviews, 'cleanliness')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Communication</p>
                      <p className="font-semibold text-lg" style={{ color: '#1F2937' }}>
                        {getCategoryAverage(propertyReviews, 'communication')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Location</p>
                      <p className="font-semibold text-lg" style={{ color: '#1F2937' }}>
                        {getCategoryAverage(propertyReviews, 'location')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Value</p>
                      <p className="font-semibold text-lg" style={{ color: '#1F2937' }}>
                        {getCategoryAverage(propertyReviews, 'value')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5" style={{ color: '#2D5F5D' }} />
            <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
              <select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              >
                <option value="all">All Properties</option>
                {properties.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              >
                <option value="all">All Channels</option>
                {channels.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              >
                <option value="all">All Ratings</option>
                <option value="9">9+ Stars</option>
                <option value="8">8+ Stars</option>
                <option value="7">7+ Stars</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              >
                <option value="date">Most Recent</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold" style={{ color: '#1F2937' }}>
              Reviews ({sortedReviews.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {sortedReviews.map(review => (
              <div key={review.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-lg" style={{ color: '#1F2937' }}>
                        {review.guestName}
                      </h3>
                      <span className="px-2.5 py-1 bg-gray-100 text-xs font-medium rounded-full text-gray-700">
                        {review.channel}
                      </span>
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ backgroundColor: '#E8F4F3', color: '#2D5F5D' }}>
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-semibold">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{review.listingName}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleReviewSelection(review.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ml-4 ${
                      selectedReviews.has(review.id)
                        ? 'text-white hover:opacity-90'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={selectedReviews.has(review.id) ? { backgroundColor: '#10B981' } : {}}
                  >
                    {selectedReviews.has(review.id) ? (
                      <>
                        <Check className="w-4 h-4" />
                        Public
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Hidden
                      </>
                    )}
                  </button>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">{review.publicReview}</p>
                <div className="flex gap-4 flex-wrap text-sm">
                  {review.reviewCategory.map(cat => (
                    <div key={cat.category} className="flex items-center gap-1.5">
                      <span className="text-gray-600 capitalize">
                        {cat.category.replace(/_/g, ' ')}:
                      </span>
                      <span className="font-semibold" style={{ color: '#1F2937' }}>
                        {cat.rating}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlexLivingDashboard;