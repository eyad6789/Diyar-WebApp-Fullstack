import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersAPI, propertiesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('properties');

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getProfile(username);
      setProfile(response.data.user);
      
      // Load user's properties
      const propertiesResponse = await propertiesAPI.getUserProperties(username);
      setProperties(propertiesResponse.data.properties || []);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('فشل في تحميل الملف الشخصي. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, currency = 'IQD') => {
    return new Intl.NumberFormat('ar-IQ').format(price) + ' ' + currency;
  };

  const getCategoryText = (category) => {
    const categories = {
      apartment: 'شقة',
      house: 'بيت',
      villa: 'فيلا',
      land: 'أرض',
      office: 'مكتب',
      shop: 'محل تجاري'
    };
    return categories[category] || category;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadProfile}
            className="bg-diyari-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            المحاولة مرة أخرى
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">المستخدم غير موجود</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === username;

  return (
    <div className="min-h-screen bg-diyari-light py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={profile.profile_picture || '/default-avatar.png'}
                alt={profile.full_name || profile.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-diyari-light"
              />
              {profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-diyari-primary rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">@{profile.username}</h1>
                {isOwnProfile && (
                  <Link
                    to="/settings"
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    تعديل الملف الشخصي
                  </Link>
                )}
              </div>
              
              {profile.full_name && (
                <p className="text-lg text-gray-800 mb-2">{profile.full_name}</p>
              )}
              
              {profile.bio && (
                <p className="text-gray-600 mb-4 leading-relaxed">{profile.bio}</p>
              )}
              
              {profile.location && (
                <div className="flex items-center gap-1 text-gray-600 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{profile.location}</span>
                </div>
              )}
              
              <div className="flex gap-8 text-sm">
                <div className="text-center">
                  <span className="font-bold text-lg text-diyari-dark">{properties.length}</span>
                  <p className="text-gray-600">عقار</p>
                </div>
                <div className="text-center">
                  <span className="font-bold text-lg text-diyari-dark">{profile.followers_count || 0}</span>
                  <p className="text-gray-600">متابع</p>
                </div>
                <div className="text-center">
                  <span className="font-bold text-lg text-diyari-dark">{profile.following_count || 0}</span>
                  <p className="text-gray-600">يتابع</p>
                </div>
                <div className="text-center">
                  <span className="font-bold text-lg text-diyari-dark">{profile.total_views || 0}</span>
                  <p className="text-gray-600">مشاهدة</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('properties')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'properties'
                    ? 'border-diyari-primary text-diyari-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                العقارات ({properties.length})
              </button>
              <button
                onClick={() => setActiveTab('reels')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'reels'
                    ? 'border-diyari-primary text-diyari-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                الفيديوهات
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'saved'
                    ? 'border-diyari-primary text-diyari-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                المحفوظات
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'properties' && (
            <>
              {properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <Link
                      key={property.id}
                      to={`/property/${property.id}`}
                      className="group block"
                    >
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative h-48 bg-gray-200">
                          {property.image_urls ? (
                            <img
                              src={JSON.parse(property.image_urls)[0]}
                              alt={property.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-1">
                            <span className="bg-white bg-opacity-90 text-xs px-2 py-1 rounded">
                              {property.property_type === 'sale' ? 'للبيع' : 'للإيجار'}
                            </span>
                            <span className="bg-diyari-primary text-white text-xs px-2 py-1 rounded">
                              {getCategoryText(property.category)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{property.title}</h3>
                          <p className="text-lg font-bold text-diyari-primary mb-2">
                            {formatPrice(property.price, property.currency)}
                          </p>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span>{property.location}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-3">
                              {property.bedrooms && <span>🛏️ {property.bedrooms}</span>}
                              {property.area && <span>📐 {property.area}م²</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <span>❤️ {property.like_count}</span>
                              <span>👁️ {property.views_count}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد عقارات حالياً</h3>
                  <p className="text-gray-500">
                    {isOwnProfile 
                      ? 'ابدأ بإضافة عقارك الأول!' 
                      : `لم يشارك ${profile.username} أي عقارات بعد.`
                    }
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'reels' && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد فيديوهات</h3>
              <p className="text-gray-500">الفيديوهات ستظهر هنا</p>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد عقارات محفوظة</h3>
              <p className="text-gray-500">العقارات المحفوظة ستظهر هنا</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
