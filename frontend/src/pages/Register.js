import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(formData);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-diyari-light to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src="/Logo.png" alt="ديــاري" className="h-20 w-20" />
          </div>
          <h1 className="text-4xl font-bold text-diyari-primary font-arabic mb-2">
            ديــاري
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 font-arabic">
            انضم إلى منصة العقارات الرائدة
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            أنشئ حسابك الجديد وابدأ رحلتك في عالم العقارات
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                الاسم الكامل
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary focus:z-10 sm:text-sm"
                placeholder="أدخل اسمك الكامل"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                اسم المستخدم *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary focus:z-10 sm:text-sm"
                placeholder="اختر اسم مستخدم فريد"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary focus:z-10 sm:text-sm"
                placeholder="أدخل بريدك الإلكتروني"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                رقم الهاتف
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary focus:z-10 sm:text-sm"
                placeholder="07xxxxxxxxx"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-diyari-primary focus:border-diyari-primary focus:z-10 sm:text-sm"
                placeholder="أدخل كلمة مرور قوية"
                value={formData.password}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-500">
                يجب أن تحتوي على 8 أحرف على الأقل
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-diyari-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-diyari-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="font-medium text-diyari-primary hover:text-blue-700 transition-colors">
                تسجيل الدخول
              </Link>
            </span>
          </div>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>بإنشاء حساب، أنت توافق على</p>
          <div className="space-x-4 space-x-reverse mt-1">
            <Link to="/terms" className="hover:text-diyari-primary">شروط الاستخدام</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-diyari-primary">سياسة الخصوصية</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
