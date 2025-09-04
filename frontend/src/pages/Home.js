import React, { useState, useEffect } from 'react';
import { propertiesAPI } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    city: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    loadFeed();
  }, [filters]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getFeed(filters);
      setProperties(response.data.properties);
    } catch (error) {
      console.error('Error loading feed:', error);
      setError('فشل في تحميل العقارات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      city: '',
      minPrice: '',
      maxPrice: ''
    });
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
            onClick={loadFeed}
            className="bg-diyari-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            المحاولة مرة أخرى
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-diyari-light py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-diyari-dark mb-2">مرحباً بك في ديــاري</h1>
          <p className="text-gray-600">اكتشف أفضل العقارات في العراق</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع العرض</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
              >
                <option value="">الكل</option>
                <option value="sale">للبيع</option>
                <option value="rent">للإيجار</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع العقار</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
              >
                <option value="">الكل</option>
                <option value="apartment">شقة</option>
                <option value="house">بيت</option>
                <option value="villa">فيلا</option>
                <option value="land">أرض</option>
                <option value="office">مكتب</option>
                <option value="shop">محل تجاري</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المحافظة</label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
              >
                <option value="">الكل</option>
                <option value="بغداد">بغداد</option>
                <option value="البصرة">البصرة</option>
                <option value="أربيل">أربيل</option>
                <option value="النجف">النجف</option>
                <option value="كربلاء">كربلاء</option>
                <option value="الموصل">الموصل</option>
                <option value="السليمانية">السليمانية</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السعر الأدنى</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="0"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السعر الأعلى</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="∞"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-diyari-secondary hover:text-green-700 text-sm font-medium"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">لا توجد عقارات حالياً</h2>
            <p className="text-gray-500 mb-6">كن أول من يشارك عقاره على المنصة!</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-diyari-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إضافة عقار جديد
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onPropertyUpdate={loadFeed}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {properties.length > 0 && (
          <div className="text-center mt-8">
            <button 
              onClick={loadFeed}
              className="bg-white text-diyari-primary border border-diyari-primary px-6 py-3 rounded-lg hover:bg-diyari-primary hover:text-white transition-colors"
            >
              تحميل المزيد
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
