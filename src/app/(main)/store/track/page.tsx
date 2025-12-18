'use client';

import { useState, useEffect, Suspense } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { FaSearch, FaArrowLeft, FaBox, FaClock, FaTruck, FaCheck, FaTimes, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

interface OrderItem {
  id: string;
  product_name: string;
  variant_info?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  notes?: string;
  items: OrderItem[];
  created_at: string;
}

const STATUS_CONFIG = {
  pending: {
    label: { en: 'Pending', bn: 'পেন্ডিং' },
    color: 'yellow',
    icon: FaClock,
    description: { en: 'Your order is being reviewed', bn: 'আপনার অর্ডার পর্যালোচনা করা হচ্ছে' }
  },
  processing: {
    label: { en: 'Processing', bn: 'প্রসেসিং' },
    color: 'blue',
    icon: FaBox,
    description: { en: 'Your order is being prepared', bn: 'আপনার অর্ডার প্রস্তুত করা হচ্ছে' }
  },
  delivered: {
    label: { en: 'Delivered', bn: 'ডেলিভার্ড' },
    color: 'green',
    icon: FaCheck,
    description: { en: 'Your order has been delivered', bn: 'আপনার অর্ডার ডেলিভারি হয়েছে' }
  },
  cancelled: {
    label: { en: 'Cancelled', bn: 'বাতিল' },
    color: 'red',
    icon: FaTimes,
    description: { en: 'Your order was cancelled', bn: 'আপনার অর্ডার বাতিল হয়েছে' }
  },
};

function TrackOrderContent() {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const searchParams = useSearchParams();

  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Auto-search if order number is in URL
  useEffect(() => {
    if (searchParams.get('order')) {
      setOrderNumber(searchParams.get('order') || '');
    }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim() || !phone.trim()) {
      setError(language === 'bn' ? 'অর্ডার নম্বর এবং ফোন নম্বর দিন' : 'Please enter order number and phone number');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await fetch(
        `/api/store/orders?order_number=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to find order');
      }

      const data = await response.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = (currentStatus: Order['status']) => {
    const steps = ['pending', 'processing', 'delivered'];
    const currentIndex = steps.indexOf(currentStatus);
    const isCancelled = currentStatus === 'cancelled';

    return steps.map((step, index) => ({
      status: step as keyof typeof STATUS_CONFIG,
      isCompleted: !isCancelled && index <= currentIndex,
      isCurrent: step === currentStatus,
    }));
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <FaTruck className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl font-bold mb-2">
            {language === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Your Order'}
          </h1>
          <p className="opacity-90">
            {language === 'bn'
              ? 'আপনার অর্ডার নম্বর এবং ফোন নম্বর দিয়ে অর্ডারের অবস্থা জানুন'
              : 'Enter your order number and phone number to check order status'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/store"
          className={`inline-flex items-center gap-2 mb-6 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <FaArrowLeft /> {language === 'bn' ? 'স্টোরে ফিরুন' : 'Back to Store'}
        </Link>

        {/* Search Form */}
        <form onSubmit={handleSearch} className={`p-6 rounded-xl mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {language === 'bn' ? 'অর্ডার নম্বর' : 'Order Number'}
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="ORD-XXXXXXXX-XXXX"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span>{language === 'bn' ? 'খুঁজছি...' : 'Searching...'}</span>
            ) : (
              <>
                <FaSearch /> {language === 'bn' ? 'অর্ডার খুঁজুন' : 'Find Order'}
              </>
            )}
          </button>
        </form>

        {/* Order Details */}
        {order && (
          <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            {/* Order Header */}
            <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {language === 'bn' ? 'অর্ডার নম্বর' : 'Order Number'}
                  </p>
                  <p className={`text-xl font-bold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {order.order_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {language === 'bn' ? 'অর্ডারের তারিখ' : 'Order Date'}
                  </p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {format(new Date(order.created_at), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Progress */}
            <div className="p-6">
              {order.status === 'cancelled' ? (
                <div className="flex items-center justify-center gap-3 py-4 text-red-500">
                  <FaTimes className="w-8 h-8" />
                  <div>
                    <p className="font-bold text-lg">
                      {STATUS_CONFIG.cancelled.label[language]}
                    </p>
                    <p className="text-sm">
                      {STATUS_CONFIG.cancelled.description[language]}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Current Status */}
                  <div className="text-center mb-6">
                    {(() => {
                      const config = STATUS_CONFIG[order.status];
                      const StatusIcon = config.icon;
                      return (
                        <>
                          <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                            config.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                            config.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                            config.color === 'green' ? 'bg-green-100 text-green-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            <StatusIcon className="w-8 h-8" />
                          </div>
                          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {config.label[language]}
                          </h3>
                          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {config.description[language]}
                          </p>
                        </>
                      );
                    })()}
                  </div>

                  {/* Progress Steps */}
                  <div className="flex items-center justify-center gap-2 md:gap-4">
                    {getStatusSteps(order.status).map((step, index) => {
                      const config = STATUS_CONFIG[step.status];
                      const StepIcon = config.icon;

                      return (
                        <div key={step.status} className="flex items-center">
                          <div className={`flex flex-col items-center ${
                            index > 0 ? 'ml-2 md:ml-4' : ''
                          }`}>
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
                              step.isCompleted
                                ? 'bg-green-500 text-white'
                                : isDark
                                  ? 'bg-gray-700 text-gray-500'
                                  : 'bg-gray-200 text-gray-400'
                            }`}>
                              <StepIcon className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <span className={`text-xs mt-1 ${
                              step.isCompleted
                                ? isDark ? 'text-green-400' : 'text-green-600'
                                : isDark ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {config.label[language]}
                            </span>
                          </div>
                          {index < 2 && (
                            <div className={`w-8 md:w-16 h-1 mx-1 md:mx-2 rounded ${
                              step.isCompleted && getStatusSteps(order.status)[index + 1]?.isCompleted
                                ? 'bg-green-500'
                                : isDark ? 'bg-gray-700' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Order Items */}
            <div className={`p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'অর্ডারকৃত পণ্য' : 'Ordered Items'}
              </h4>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.product_name}
                      </p>
                      {item.variant_info && (
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.variant_info}
                        </p>
                      )}
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        ৳{item.unit_price} × {item.quantity}
                      </p>
                    </div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ৳{item.total_price.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className={`p-6 border-t ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}
                  </span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    ৳{order.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {language === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}
                  </span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    ৳{order.delivery_fee.toLocaleString()}
                  </span>
                </div>
                <div className={`flex justify-between pt-2 border-t font-bold ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {language === 'bn' ? 'মোট' : 'Total'}
                  </span>
                  <span className="text-red-600">
                    ৳{order.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className={`p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'ডেলিভারি তথ্য' : 'Delivery Information'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <FaPhone className={`w-4 h-4 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {language === 'bn' ? 'ফোন' : 'Phone'}
                    </p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {order.customer_phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className={`w-4 h-4 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {language === 'bn' ? 'ঠিকানা' : 'Address'}
                    </p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {order.customer_address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Order Found */}
        {searched && !loading && !order && !error && (
          <div className={`text-center py-12 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <FaBox className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'bn' ? 'অর্ডার পাওয়া যায়নি' : 'Order Not Found'}
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'bn'
                ? 'অনুগ্রহ করে সঠিক অর্ডার নম্বর এবং ফোন নম্বর দিন'
                : 'Please check your order number and phone number'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
