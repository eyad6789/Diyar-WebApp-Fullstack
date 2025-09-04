import React, { useState } from 'react';
import { propertiesAPI, messagesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PropertyCard = ({ property, onPropertyUpdate }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(property.is_liked === 1);
  const [likeCount, setLikeCount] = useState(property.like_count);
  const [showContact, setShowContact] = useState(false);

  const handleLike = async () => {
    try {
      const response = await propertiesAPI.likeProperty(property.id);
      setLiked(response.data.liked);
      setLikeCount(prev => response.data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error liking property:', error);
    }
  };

  const handleWhatsApp = () => {
    const message = `مرحباً، أنا مهتم بعقارك: ${property.title}`;
    const whatsappUrl = `https://wa.me/${property.contact_whatsapp || property.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSendMessage = async () => {
    try {
      await messagesAPI.sendPropertyInquiry(property.id);
      alert('تم إرسال الاستفسار بنجاح');
      setShowContact(false);
    } catch (error) {
      console.error('Error sending inquiry:', error);
      alert('فشل في إرسال الاستفسار');
    }
  };

  const formatPrice = (price, currency) => {
    const formattedPrice = new Intl.NumberFormat('ar-IQ').format(price);
    return `${formattedPrice} ${currency === 'USD' ? 'دولار' : 'دينار'}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'الآن';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    if (diffInHours < 168) return `منذ ${Math.floor(diffInHours / 24)} يوم`;
    return `منذ ${Math.floor(diffInHours / 168)} أسبوع`;
  };

  const getPropertyTypeLabel = (type) => {
    return type === 'sale' ? 'للبيع' : 'للإيجار';
  };

  const getCategoryLabel = (category) => {
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-6 max-w-md mx-auto shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-diyari-primary to-diyari-secondary flex items-center justify-center text-white font-semibold ml-3">
            {property.full_name?.charAt(0) || property.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm">{property.full_name || property.username}</p>
            <p className="text-gray-500 text-xs">{formatDate(property.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            property.property_type === 'sale' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {getPropertyTypeLabel(property.property_type)}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {getCategoryLabel(property.category)}
          </span>
        </div>
      </div>

      {/* Images */}
      <div className="relative">
        {property.image_urls && property.image_urls.length > 0 ? (
          <div className="relative">
            <img 
              src={`http://localhost:5000${property.image_urls[0]}`} 
              alt={property.title}
              className="w-full h-64 object-cover"
            />
            {property.image_urls.length > 1 && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                +{property.image_urls.length - 1}
              </div>
            )}
            {property.is_featured && (
              <div className="absolute top-2 left-2 bg-diyari-gold text-white px-2 py-1 rounded-full text-xs font-medium">
                مميز
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Price */}
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{property.title}</h3>
          <p className="text-2xl font-bold text-diyari-primary">
            {formatPrice(property.price, property.currency)}
          </p>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm">{property.city}{property.district && `, ${property.district}`}</span>
        </div>

        {/* Property Details */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          {property.bedrooms && (
            <div className="flex items-center">
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              <span>{property.bedrooms} غرفة</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              <span>{property.bathrooms} حمام</span>
            </div>
          )}
          {property.area && (
            <div className="flex items-center">
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>{property.area} م²</span>
            </div>
          )}
        </div>

        {/* Description */}
        {property.description && (
          <p className="text-gray-700 text-sm mb-3 line-clamp-2">{property.description}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-1 space-x-reverse ${liked ? 'text-red-500' : 'text-gray-600'} hover:text-red-500 transition-colors`}
            >
              <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm">{likeCount}</span>
            </button>

            <button 
              onClick={() => setShowContact(!showContact)}
              className="flex items-center space-x-1 space-x-reverse text-gray-600 hover:text-diyari-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm">تواصل</span>
            </button>

            <div className="flex items-center space-x-1 space-x-reverse text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-sm">{property.views_count || 0}</span>
            </div>
          </div>

          {property.user_id !== user?.id && (
            <button 
              onClick={() => window.open(`/property/${property.id}`, '_blank')}
              className="bg-diyari-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              عرض التفاصيل
            </button>
          )}
        </div>

        {/* Contact Options */}
        {showContact && property.user_id !== user?.id && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            <button
              onClick={handleSendMessage}
              className="w-full bg-diyari-secondary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              إرسال رسالة في التطبيق
            </button>
            <button
              onClick={handleWhatsApp}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.109"/>
              </svg>
              <span>تواصل عبر واتساب</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
