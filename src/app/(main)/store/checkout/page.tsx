'use client';

import { useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useCart } from '@/stores/cart';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaShoppingBag, FaCheck, FaTruck, FaPhone, FaMapMarkerAlt, FaUser, FaEnvelope } from 'react-icons/fa';

const DELIVERY_FEE = 60;

export default function CheckoutPage() {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const { items, getSubtotal, clearCart } = useCart();
  const router = useRouter();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ order_number: string } | null>(null);

  const subtotal = getSubtotal();
  const total = subtotal + DELIVERY_FEE;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = language === 'bn' ? 'নাম দিন' : 'Name is required';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = language === 'bn' ? 'ফোন নম্বর দিন' : 'Phone number is required';
    } else if (!/^01[3-9]\d{8}$/.test(formData.customer_phone.replace(/\s/g, ''))) {
      newErrors.customer_phone = language === 'bn' ? 'সঠিক ফোন নম্বর দিন' : 'Enter a valid phone number';
    }

    if (formData.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = language === 'bn' ? 'সঠিক ইমেইল দিন' : 'Enter a valid email';
    }

    if (!formData.customer_address.trim()) {
      newErrors.customer_address = language === 'bn' ? 'ঠিকানা দিন' : 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.product_name,
        variant_info: item.variant_info,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      const response = await fetch('/api/store/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: orderItems,
          delivery_fee: DELIVERY_FEE,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to place order');
      }

      const order = await response.json();
      setOrderSuccess({ order_number: order.order_number });
      clearCart();
    } catch (error: any) {
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Success State
  if (orderSuccess) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full text-center p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500 flex items-center justify-center">
            <FaCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'bn' ? 'অর্ডার সম্পন্ন!' : 'Order Placed!'}
          </h1>
          <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'bn'
              ? 'আপনার অর্ডার সফলভাবে প্লেস হয়েছে'
              : 'Your order has been successfully placed'}
          </p>
          <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {language === 'bn' ? 'অর্ডার নম্বর' : 'Order Number'}
            </p>
            <p className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {orderSuccess.order_number}
            </p>
          </div>
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'bn'
              ? 'এই নম্বর দিয়ে আপনি আপনার অর্ডার ট্র্যাক করতে পারবেন'
              : 'You can use this number to track your order'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/store/track?order=${orderSuccess.order_number}`}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              {language === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Order'}
            </Link>
            <Link
              href="/store"
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {language === 'bn' ? 'স্টোরে ফিরুন' : 'Back to Store'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart State
  if (items.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full text-center p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
          <FaShoppingBag className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <h1 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'bn' ? 'আপনার কার্ট খালি' : 'Your cart is empty'}
          </h1>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FaArrowLeft /> {language === 'bn' ? 'স্টোরে ফিরুন' : 'Back to Store'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/store/cart"
            className={`flex items-center gap-2 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <FaArrowLeft /> {language === 'bn' ? 'কার্টে ফিরুন' : 'Back to Cart'}
          </Link>
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'bn' ? 'চেকআউট' : 'Checkout'}
          </h1>
          <div className="w-24"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'ডেলিভারি তথ্য' : 'Delivery Information'}
              </h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <FaUser className="inline mr-2" />
                    {language === 'bn' ? 'নাম *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.customer_name
                        ? 'border-red-500'
                        : isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={language === 'bn' ? 'আপনার নাম' : 'Your full name'}
                  />
                  {errors.customer_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <FaPhone className="inline mr-2" />
                    {language === 'bn' ? 'ফোন নম্বর *' : 'Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.customer_phone
                        ? 'border-red-500'
                        : isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="01XXXXXXXXX"
                  />
                  {errors.customer_phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.customer_phone}</p>
                  )}
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <FaEnvelope className="inline mr-2" />
                    {language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
                  </label>
                  <input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.customer_email
                        ? 'border-red-500'
                        : isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="email@example.com"
                  />
                  {errors.customer_email && (
                    <p className="text-red-500 text-sm mt-1">{errors.customer_email}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <FaMapMarkerAlt className="inline mr-2" />
                    {language === 'bn' ? 'সম্পূর্ণ ঠিকানা *' : 'Full Address *'}
                  </label>
                  <textarea
                    value={formData.customer_address}
                    onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.customer_address
                        ? 'border-red-500'
                        : isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={language === 'bn' ? 'বাড়ি নম্বর, রোড নম্বর, এলাকা...' : 'House no, Road no, Area...'}
                  />
                  {errors.customer_address && (
                    <p className="text-red-500 text-sm mt-1">{errors.customer_address}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {language === 'bn' ? 'অতিরিক্ত নোট (ঐচ্ছিক)' : 'Additional Notes (Optional)'}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={language === 'bn' ? 'ডেলিভারি সংক্রান্ত কোন নির্দেশনা...' : 'Any delivery instructions...'}
                  />
                </div>

                {errors.submit && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                    {errors.submit}
                  </div>
                )}

                {/* Payment Method Info */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                  <div className="flex items-center gap-3">
                    <FaTruck className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                    <div>
                      <p className={`font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                        {language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-green-500' : 'text-green-600'}`}>
                        {language === 'bn'
                          ? 'পণ্য হাতে পেয়ে পেমেন্ট করুন'
                          : 'Pay when you receive the product'}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-red-600 text-white rounded-xl text-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? (language === 'bn' ? 'প্রসেসিং...' : 'Processing...')
                    : (language === 'bn' ? 'অর্ডার প্লেস করুন' : 'Place Order')}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`sticky top-4 p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'অর্ডার সারাংশ' : 'Order Summary'}
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div
                    key={`${item.product_id}-${item.variant_id}`}
                    className="flex gap-3"
                  >
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${
                          isDark ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <FaShoppingBag className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.product_name}
                      </p>
                      {item.variant_info && (
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.variant_info}
                        </p>
                      )}
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        ৳{item.unit_price} × {item.quantity}
                      </p>
                    </div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ৳{(item.unit_price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className={`pt-4 border-t space-y-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}
                  </span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {language === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}
                  </span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    ৳{DELIVERY_FEE.toLocaleString()}
                  </span>
                </div>
                <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'bn' ? 'মোট' : 'Total'}
                  </span>
                  <span className="font-bold text-xl text-red-600">
                    ৳{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
