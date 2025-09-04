import React, { useState, useEffect } from 'react';
import { propertiesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Map = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [hoveredProperty, setHoveredProperty] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 33.3152, lng: 44.3661 }); // Baghdad coordinates
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getFeed();
      const propertiesWithCoords = response.data.properties.filter(
        property => property.latitude && property.longitude
      );
      setProperties(propertiesWithCoords);
    } catch (error) {
      console.error('Error loading properties:', error);
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

  const getMarkerColor = (propertyType) => {
    return propertyType === 'sale' ? '#2563eb' : '#16a34a'; // Blue for sale, Green for rent
  };

  // Simple map implementation (you can replace with Google Maps, Leaflet, etc.)
  const MapContainer = () => (
    <div className="relative w-full h-full bg-gray-200 overflow-hidden">
      {/* Map Background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)
          `
        }}
      >
        {/* Grid overlay to simulate map */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Property Markers */}
      {properties.map((property) => {
        // Convert lat/lng to screen coordinates (simplified)
        const x = ((property.longitude - 44.0) * 800) + 200;
        const y = ((33.5 - property.latitude) * 600) + 100;
        
        return (
          <div
            key={property.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110"
            style={{ left: `${x}px`, top: `${y}px` }}
            onMouseEnter={() => setHoveredProperty(property)}
            onMouseLeave={() => setHoveredProperty(null)}
            onClick={() => setSelectedProperty(property)}
          >
            {/* Marker */}
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
              style={{ backgroundColor: getMarkerColor(property.property_type) }}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            
            {/* Price label */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-semibold whitespace-nowrap">
              {formatPrice(property.price, property.currency)}
            </div>
          </div>
        );
      })}

      {/* Hover Popup */}
      {hoveredProperty && (
        <div 
          className="absolute z-10 bg-white rounded-lg shadow-xl p-4 w-80 border border-gray-200"
          style={{
            left: `${((hoveredProperty.longitude - 44.0) * 800) + 220}px`,
            top: `${((33.5 - hoveredProperty.latitude) * 600) + 50}px`
          }}
        >
          <div className="flex gap-3">
            <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {hoveredProperty.image_urls ? (
                <img
                  src={JSON.parse(hoveredProperty.image_urls)[0]}
                  alt={hoveredProperty.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{hoveredProperty.title}</h3>
              <p className="text-lg font-bold text-diyari-primary mb-1">
                {formatPrice(hoveredProperty.price, hoveredProperty.currency)}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span className="bg-diyari-light px-2 py-1 rounded text-xs">
                  {hoveredProperty.property_type === 'sale' ? 'للبيع' : 'للإيجار'}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {getCategoryText(hoveredProperty.category)}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{hoveredProperty.location}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button 
          onClick={() => setZoom(prev => Math.min(prev + 1, 18))}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button 
          onClick={() => setZoom(prev => Math.max(prev - 1, 1))}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
        <h4 className="font-semibold text-sm mb-2">الخريطة</h4>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-xs">للبيع</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600"></div>
          <span className="text-xs">للإيجار</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-screen bg-diyari-light">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-diyari-dark">خريطة العقارات</h1>
            <p className="text-gray-600">اكتشف العقارات على الخريطة ({properties.length} عقار)</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
              onChange={(e) => {
                const city = e.target.value;
                if (city === 'بغداد') setMapCenter({ lat: 33.3152, lng: 44.3661 });
                else if (city === 'البصرة') setMapCenter({ lat: 30.5085, lng: 47.7804 });
                else if (city === 'أربيل') setMapCenter({ lat: 36.1911, lng: 44.0094 });
              }}
            >
              <option value="">اختر المحافظة</option>
              <option value="بغداد">بغداد</option>
              <option value="البصرة">البصرة</option>
              <option value="أربيل">أربيل</option>
              <option value="النجف">النجف</option>
              <option value="كربلاء">كربلاء</option>
            </select>
            
            <button 
              onClick={loadProperties}
              className="bg-diyari-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              تحديث
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer />
        </div>

        {/* Selected Property Details Modal */}
        {selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{selectedProperty.title}</h2>
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
                      {selectedProperty.image_urls ? (
                        <img
                          src={JSON.parse(selectedProperty.image_urls)[0]}
                          alt={selectedProperty.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-2xl font-bold text-diyari-primary mb-3">
                      {formatPrice(selectedProperty.price, selectedProperty.currency)}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">النوع:</span>
                        <span>{selectedProperty.property_type === 'sale' ? 'للبيع' : 'للإيجار'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الفئة:</span>
                        <span>{getCategoryText(selectedProperty.category)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الموقع:</span>
                        <span>{selectedProperty.location}</span>
                      </div>
                      {selectedProperty.bedrooms && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">الغرف:</span>
                          <span>{selectedProperty.bedrooms}</span>
                        </div>
                      )}
                      {selectedProperty.area && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">المساحة:</span>
                          <span>{selectedProperty.area} م²</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => window.location.href = `/property/${selectedProperty.id}`}
                        className="flex-1 bg-diyari-primary text-white py-2 rounded-lg hover:bg-blue-700"
                      >
                        عرض التفاصيل
                      </button>
                      <button
                        onClick={() => {
                          const message = `مرحباً، أنا مهتم بالعقار: ${selectedProperty.title}`;
                          const whatsappUrl = `https://wa.me/${selectedProperty.phone}?text=${encodeURIComponent(message)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                      >
                        واتساب
                      </button>
                    </div>
                  </div>
                </div>

                {selectedProperty.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold mb-2">الوصف</h3>
                    <p className="text-gray-700">{selectedProperty.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
