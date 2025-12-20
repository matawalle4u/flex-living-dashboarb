import React, { useState, useEffect } from 'react';
import { Star, Filter, TrendingUp, Building2, Calendar, MessageSquare, Check, X, Eye, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { normalizeReview, isValidNormalizedReview } from '../utils/reviewNormalizer';
const ErrorModal = ({ error, onClose, onRetry }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-full bg-red-100">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Connection Error
            </h3>
            <p className="text-gray-600 text-sm mb-1">
              {error.message || 'Unable to fetch reviews from the server.'}
            </p>
            <p className="text-gray-500 text-xs">
              {error.details || 'Please check if the backend server is running on port 3009.'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Dismiss
          </button>
          <button
            onClick={onRetry}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition font-medium flex items-center gap-2"
            style={{ backgroundColor: '#2D5F5D' }}
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};

const WarningBanner = ({ message, onDismiss }) => {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-amber-800 font-medium text-sm">Warning</p>
            <p className="text-amber-700 text-sm mt-1">{message}</p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-amber-600 hover:text-amber-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const fetchHostawayReviews = async () => {
 
  const response = await fetch('/api/reviews/hostaway');
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: `Server Error (${response.status})`,
      details: errorData.message || 'The server returned an error. Please try again.',
      status: response.status
    };
  }
  
  const data = await response.json();
  
  //handle normalization verification
  if (data.result && Array.isArray(data.result)) {
    const validReviews = data.result.filter(review => 
      isValidNormalizedReview(review)
    );
    
    if (validReviews.length !== data.result.length) {
      console.warn(`Filtered out ${data.result.length - validReviews.length} invalid reviews`);
    }
    
    return {
      ...data,
      result: validReviews
    };
  }
  
  return data;
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
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    setWarning(null);
    
    try {
      const data = await fetchHostawayReviews();
      
      if (!data.result || !Array.isArray(data.result)) {
        throw {
          message: 'Invalid Data Format',
          details: 'The server returned data in an unexpected format.'
        };
      }
      
      if (data.result.length === 0) {
        setWarning('No reviews found. The system is working, but there are currently no reviews to display.');
      }
      
      setReviews(data.result);
      const autoSelect = new Set(
        data.result.filter(r => r.rating >= 9).map(r => r.id)
      );
      setSelectedReviews(autoSelect);
    } catch (err) {
      console.error('Error loading reviews:', err);
      
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError({
          message: 'Cannot Connect to Server',
          details: 'Please ensure the backend server is running on http://localhost:3009'
        });
      } else {
        setError({
          message: err.message || 'Failed to Load Reviews',
          details: err.details || 'An unexpected error occurred. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
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
    
    // Group reviews by property
    const reviewsByProperty = publicReviews.reduce((acc, review) => {
      const propertyName = review.listingName;
      if (!acc[propertyName]) {
        acc[propertyName] = [];
      }
      acc[propertyName].push(review);
      return acc;
    }, {});

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
          {publicReviews.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No public reviews available yet.</p>
            </div>
          ) : (
            <div className="space-y-24">
              {Object.entries(reviewsByProperty).map(([propertyName, propertyReviews], propertyIndex) => (
                <div key={propertyName}>
                  <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-light mb-4" style={{ color: '#1F2937' }}>
                      {propertyName}
                    </h1>
                    <p className="text-lg text-gray-600 font-light">
                      Modern apartment in London
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

                    <div className="space-y-8">
                      {propertyReviews.map((review, index) => (
                        <div key={review.id} className={`pb-8 ${index !== propertyReviews.length - 1 ? 'border-b border-gray-200' : ''}`}>
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
                  </div>
                </div>
              ))}
            </div>
          )}
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
      {error && (
        <ErrorModal 
          error={error} 
          onClose={() => setError(null)} 
          onRetry={loadReviews}
        />
      )}

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
        {warning && (
          <WarningBanner 
            message={warning} 
            onDismiss={() => setWarning(null)}
          />
        )}

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
              {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}
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

        {reviews.length > 0 && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default FlexLivingDashboard;