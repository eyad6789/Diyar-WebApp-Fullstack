import React, { useState, useEffect } from 'react';
import { propertyRequestsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const PropertyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'sale',
    category: 'apartment',
    min_price: '',
    max_price: '',
    city: '',
    district: '',
    bedrooms: '',
    bathrooms: '',
    min_area: '',
    max_area: '',
    features: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await propertyRequestsAPI.getUserRequests();
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await propertyRequestsAPI.createRequest(formData);
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        property_type: 'sale',
        category: 'apartment',
        min_price: '',
        max_price: '',
        city: '',
        district: '',
        bedrooms: '',
        bathrooms: '',
        min_area: '',
        max_area: '',
        features: ''
      });
      loadRequests();
    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await propertyRequestsAPI.updateStatus(requestId, status);
      loadRequests();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-IQ').format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'paused': return 'متوقف';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-diyari-light py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-diyari-dark mb-2">طلبات العقارات</h1>
            <p className="text-gray-600">أنشئ طلب عقار وسنجد لك المطابقات المناسبة</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-diyari-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            طلب جديد
          </button>
        </div>

        {/* Create Request Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-diyari-dark">إنشاء طلب عقار جديد</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الطلب</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
                      placeholder="مثال: أبحث عن شقة في بغداد"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">وصف الطلب</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
                      placeholder="اكتب تفاصيل إضافية عن العقار المطلوب..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">نوع العرض</label>
                      <select
                        name="property_type"
                        value={formData.property_type}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
                      >
                        <option value="sale">للبيع</option>
                        <option value="rent">للإيجار</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">نوع العقار</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
                      >
                        <option value="apartment">شقة</option>
                        <option value="house">بيت</option>
                        <option value="villa">فيلا</option>
                        <option value="land">أرض</option>
                        <option value="office">مكتب</option>
                        <option value="shop">محل تجاري</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">السعر الأدنى</label>
                      <input
                        type="number"
                        name="min_price"
                        value={formData.min_price}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">السعر الأعلى</label>
                      <input
                        type="number"
                        name="max_price"
                        value={formData.max_price}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
                        placeholder="∞"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المحافظة</label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
                      >
                        <option value="">اختر المحافظة</option>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">المنطقة</label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
                        placeholder="اسم المنطقة"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">عدد الغرف</label>
                      <select
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
                      >
                        <option value="">الكل</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5+</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">عدد الحمامات</label>
                      <select
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
                      >
                        <option value="">الكل</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4+</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المساحة الأدنى</label>
                      <input
                        type="number"
                        name="min_area"
                        value={formData.min_area}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
                        placeholder="م²"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المساحة الأعلى</label>
                      <input
                        type="number"
                        name="max_area"
                        value={formData.max_area}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
                        placeholder="م²"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المميزات المطلوبة</label>
                    <textarea
                      name="features"
                      value={formData.features}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary"
                      placeholder="مثال: موقف سيارة، حديقة، مصعد..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-diyari-primary text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'جاري الإنشاء...' : 'إنشاء الطلب'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">لا توجد طلبات حالياً</h2>
            <p className="text-gray-500 mb-6">أنشئ طلب عقار جديد وسنجد لك أفضل المطابقات</p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-diyari-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              إنشاء طلب جديد
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">{request.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">النوع:</span>
                    <span>{request.property_type === 'sale' ? 'للبيع' : 'للإيجار'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الفئة:</span>
                    <span>
                      {request.category === 'apartment' ? 'شقة' :
                       request.category === 'house' ? 'بيت' :
                       request.category === 'villa' ? 'فيلا' :
                       request.category === 'land' ? 'أرض' :
                       request.category === 'office' ? 'مكتب' :
                       request.category === 'shop' ? 'محل تجاري' : request.category}
                    </span>
                  </div>
                  {request.city && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">المحافظة:</span>
                      <span>{request.city}</span>
                    </div>
                  )}
                  {(request.min_price || request.max_price) && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">السعر:</span>
                      <span>
                        {request.min_price && formatPrice(request.min_price)}
                        {request.min_price && request.max_price && ' - '}
                        {request.max_price && formatPrice(request.max_price)}
                        {!request.min_price && !request.max_price && 'غير محدد'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    {request.status === 'active' && (
                      <button
                        onClick={() => handleStatusUpdate(request.id, 'paused')}
                        className="flex-1 bg-yellow-500 text-white py-2 px-3 rounded text-sm hover:bg-yellow-600"
                      >
                        إيقاف مؤقت
                      </button>
                    )}
                    {request.status === 'paused' && (
                      <button
                        onClick={() => handleStatusUpdate(request.id, 'active')}
                        className="flex-1 bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600"
                      >
                        تفعيل
                      </button>
                    )}
                    {(request.status === 'active' || request.status === 'paused') && (
                      <button
                        onClick={() => handleStatusUpdate(request.id, 'completed')}
                        className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600"
                      >
                        إكمال
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyRequests;
