import React, { useState, useEffect } from 'react';
import { propertiesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getReels();
      setReels(response.data.properties);
    } catch (error) {
      console.error('Error loading reels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (propertyId) => {
    try {
      await propertiesAPI.likeProperty(propertyId);
      setReels(prev => prev.map(reel => 
        reel.id === propertyId 
          ? { ...reel, is_liked: !reel.is_liked, like_count: reel.is_liked ? reel.like_count - 1 : reel.like_count + 1 }
          : reel
      ));
    } catch (error) {
      console.error('Error liking property:', error);
    }
  };

  const handleWhatsApp = (phone, propertyTitle) => {
    const message = `مرحباً، أنا مهتم بالعقار: ${propertyTitle}`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatPrice = (price, currency = 'IQD') => {
    return new Intl.NumberFormat('ar-IQ').format(price) + ' ' + currency;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (reels.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">لا توجد فيديوهات حالياً</h2>
          <p className="text-gray-400">كن أول من يشارك فيديو عقار!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Reels Container */}
      <div className="h-screen flex items-center justify-center">
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className={`absolute inset-0 transition-transform duration-300 ${
              index === currentIndex ? 'translate-x-0' : 
              index < currentIndex ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            {/* Video */}
            <div className="relative h-full flex items-center justify-center bg-black">
              {reel.video_url ? (
                <video
                  className="max-h-full max-w-full object-contain"
                  controls
                  autoPlay={index === currentIndex}
                  muted
                  loop
                >
                  <source src={reel.video_url} type="video/mp4" />
                  متصفحك لا يدعم تشغيل الفيديو
                </video>
              ) : (
                <div className="text-white text-center">
                  <p>لا يوجد فيديو متاح</p>
                </div>
              )}

              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              {/* Property Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{reel.title}</h3>
                    <p className="text-lg font-semibold text-diyari-accent mb-2">
                      {formatPrice(reel.price, reel.currency)}
                    </p>
                    <div className="flex items-center gap-4 text-sm mb-2">
                      <span className="bg-white/20 px-2 py-1 rounded">
                        {reel.property_type === 'sale' ? 'للبيع' : 'للإيجار'}
                      </span>
                      <span className="bg-white/20 px-2 py-1 rounded">
                        {reel.category === 'apartment' ? 'شقة' :
                         reel.category === 'house' ? 'بيت' :
                         reel.category === 'villa' ? 'فيلا' :
                         reel.category === 'land' ? 'أرض' :
                         reel.category === 'office' ? 'مكتب' :
                         reel.category === 'shop' ? 'محل تجاري' : reel.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>📍 {reel.location}</span>
                      {reel.bedrooms && <span>🛏️ {reel.bedrooms} غرف</span>}
                      {reel.area && <span>📐 {reel.area} م²</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <img 
                        src={reel.profile_picture || '/default-avatar.png'} 
                        alt={reel.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm">@{reel.username}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col items-center gap-4 pointer-events-auto">
                    <button
                      onClick={() => handleLike(reel.id)}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        reel.is_liked ? 'bg-red-500' : 'bg-white/20'
                      }`}>
                        <svg className="w-6 h-6" fill={reel.is_liked ? 'white' : 'none'} stroke="white" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <span className="text-xs">{reel.like_count}</span>
                    </button>

                    <button className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="white" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <span className="text-xs">{reel.comment_count}</span>
                    </button>

                    <button
                      onClick={() => handleWhatsApp(reel.phone, reel.title)}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.309"/>
                        </svg>
                      </div>
                      <span className="text-xs">واتساب</span>
                    </button>

                    <button className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="white" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </div>
                      <span className="text-xs">مشاركة</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
        {currentIndex > 0 && (
          <button
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
        {currentIndex < reels.length - 1 && (
          <button
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-1">
        {reels.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Reels;
