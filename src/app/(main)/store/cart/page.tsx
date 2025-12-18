'use client';

import { useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useCart } from '@/stores/cart';
import Image from 'next/image';
import Link from 'next/link';
import { FaShoppingCart, FaArrowLeft, FaTrash, FaMinus, FaPlus, FaShoppingBag, FaTruck } from 'react-icons/fa';

const DELIVERY_FEE = 60; // Delivery fee in BDT

export default function CartPage() {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCart();

  const subtotal = getSubtotal();
  const total = subtotal + (items.length > 0 ? DELIVERY_FEE : 0);

  if (items.length === 0) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className={`text-center py-16 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <FaShoppingCart className={`w-20 h-20 mx-auto mb-6 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'bn' ? 'আপনার কার্ট খালি' : 'Your Cart is Empty'}
            </h1>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'bn'
                ? 'আমাদের স্টোর থেকে কিছু পণ্য যোগ করুন'
                : 'Add some products from our store'}
            </p>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaShoppingBag /> {language === 'bn' ? 'শপিং চালিয়ে যান' : 'Continue Shopping'}
            </Link>
          </div>
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
            href="/store"
            className={`flex items-center gap-2 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <FaArrowLeft /> {language === 'bn' ? 'শপিং চালিয়ে যান' : 'Continue Shopping'}
          </Link>
          <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'bn' ? 'শপিং কার্ট' : 'Shopping Cart'}
          </h1>
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-600 text-sm font-medium"
          >
            {language === 'bn' ? 'কার্ট খালি করুন' : 'Clear Cart'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.product_id}-${item.variant_id}`}
                className={`flex gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}
              >
                {/* Product Image */}
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
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
                      <FaShoppingBag className={isDark ? 'text-gray-600' : 'text-gray-300'} />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.product_name}
                  </h3>
                  {item.variant_info && (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.variant_info}
                    </p>
                  )}
                  <p className="text-red-600 font-bold mt-1">
                    ৳{item.unit_price.toLocaleString()}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isDark
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <FaMinus className="w-3 h-3" />
                    </button>
                    <span className={`w-8 text-center font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isDark
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.product_id, item.variant_id)}
                      className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ৳{(item.unit_price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`sticky top-4 p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'অর্ডার সারাংশ' : 'Order Summary'}
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}
                  </span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    {language === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}
                  </span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    ৳{DELIVERY_FEE.toLocaleString()}
                  </span>
                </div>
                <div className={`pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between">
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {language === 'bn' ? 'মোট' : 'Total'}
                    </span>
                    <span className="font-bold text-xl text-red-600">
                      ৳{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className={`p-3 rounded-lg mb-4 flex items-start gap-2 ${
                isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'
              }`}>
                <FaTruck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  {language === 'bn'
                    ? 'ক্যাশ অন ডেলিভারি (ঢাকা-১৮)'
                    : 'Cash on Delivery (Dhaka-18)'}
                </span>
              </div>

              <Link
                href="/store/checkout"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white rounded-xl text-lg font-bold hover:bg-red-700 transition-colors"
              >
                {language === 'bn' ? 'চেকআউট করুন' : 'Proceed to Checkout'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
