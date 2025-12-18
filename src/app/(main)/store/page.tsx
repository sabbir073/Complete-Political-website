'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import Image from 'next/image';
import Link from 'next/link';
import { FaShoppingBag, FaShoppingCart, FaSearch, FaTruck } from 'react-icons/fa';

interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  color_code?: string;
  price_adjustment: number;
  stock: number;
}

interface Product {
  id: string;
  name_en: string;
  name_bn?: string;
  slug: string;
  description_en?: string;
  description_bn?: string;
  base_price: number;
  images: string[];
  is_featured: boolean;
  variants: ProductVariant[];
}

export default function StorePage() {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/store/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getText = (en?: string, bn?: string) => {
    return language === 'bn' && bn ? bn : en || '';
  };

  const getTotalStock = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  };

  const getUniqueColors = (variants: ProductVariant[]) => {
    const colors = variants.filter(v => v.color && v.color_code).map(v => ({
      color: v.color!,
      code: v.color_code!,
    }));
    return [...new Map(colors.map(c => [c.color, c])).values()];
  };

  const getUniqueSizes = (variants: ProductVariant[]) => {
    const sizes = variants.filter(v => v.size).map(v => v.size!);
    return [...new Set(sizes)];
  };

  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.name_en.toLowerCase().includes(query) ||
      product.name_bn?.toLowerCase().includes(query) ||
      product.description_en?.toLowerCase().includes(query)
    );
  });

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-700 to-red-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <FaShoppingBag className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'bn' ? 'অফিসিয়াল স্টোর' : 'Official Store'}
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              {language === 'bn'
                ? 'আমাদের অফিসিয়াল মার্চেন্ডাইজ কিনুন এবং আন্দোলনকে সমর্থন করুন'
                : 'Shop our official merchandise and support the movement'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder={language === 'bn' ? 'পণ্য খুঁজুন...' : 'Search products...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-full border-2 transition-colors ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-red-500'
              }`}
            />
          </div>
        </div>

        {/* Delivery Info Banner */}
        <div className={`mb-8 p-4 rounded-lg flex items-center justify-center gap-3 ${
          isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'
        }`}>
          <FaTruck className="w-5 h-5" />
          <span className="font-medium">
            {language === 'bn'
              ? 'ঢাকা-১৮ এলাকায় ক্যাশ অন ডেলিভারি'
              : 'Cash on Delivery available in Dhaka-18 area'}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className={`text-center py-20 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <FaShoppingBag className={`w-20 h-20 mx-auto mb-6 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'bn' ? 'শীঘ্রই আসছে!' : 'Coming Soon!'}
            </h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'bn'
                ? 'আমাদের অফিসিয়াল মার্চেন্ডাইজ শীঘ্রই উপলব্ধ হবে'
                : 'Our official merchandise will be available soon'}
            </p>
          </div>
        ) : (
          <>
            {/* All Products */}
            <section>
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'bn' ? 'সব পণ্য' : 'All Products'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isDark={isDark}
                    getText={getText}
                    getTotalStock={getTotalStock}
                    getUniqueColors={getUniqueColors}
                    getUniqueSizes={getUniqueSizes}
                  />
                ))}
              </div>
            </section>

            {filteredProducts.length === 0 && searchQuery && (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="text-lg">
                  {language === 'bn'
                    ? `"${searchQuery}" এর জন্য কোন পণ্য পাওয়া যায়নি`
                    : `No products found for "${searchQuery}"`}
                </p>
              </div>
            )}
          </>
        )}

        {/* Track Order Link */}
        <div className="mt-12 text-center">
          <Link
            href="/store/track"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                : 'bg-white hover:bg-gray-50 text-gray-900 shadow'
            }`}
          >
            <FaTruck />
            {language === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Your Order'}
          </Link>
        </div>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({
  product,
  isDark,
  getText,
  getTotalStock,
  getUniqueColors,
  getUniqueSizes,
}: {
  product: Product;
  isDark: boolean;
  getText: (en?: string, bn?: string) => string;
  getTotalStock: (product: Product) => number;
  getUniqueColors: (variants: ProductVariant[]) => { color: string; code: string }[];
  getUniqueSizes: (variants: ProductVariant[]) => string[];
}) {
  const stock = getTotalStock(product);
  const colors = getUniqueColors(product.variants || []);
  const sizes = getUniqueSizes(product.variants || []);
  const isOutOfStock = stock === 0;

  return (
    <Link
      href={`/store/${product.slug}`}
      className={`group block rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name_en}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <FaShoppingBag className={`w-20 h-20 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_featured && (
            <span className="px-2 py-1 text-xs font-semibold bg-yellow-500 text-white rounded">
              Featured
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-1 text-xs font-semibold bg-gray-800 text-white rounded">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className={`font-semibold text-lg mb-1 group-hover:text-red-600 transition-colors ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {getText(product.name_en, product.name_bn)}
        </h3>

        {/* Price */}
        <p className="text-2xl font-bold text-red-600 mb-3">
          ৳{product.base_price.toLocaleString()}
        </p>

        {/* Sizes */}
        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {sizes.slice(0, 5).map((size) => (
              <span
                key={size}
                className={`px-2 py-0.5 text-xs rounded ${
                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {size}
              </span>
            ))}
            {sizes.length > 5 && (
              <span className={`px-2 py-0.5 text-xs rounded ${
                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                +{sizes.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Colors */}
        {colors.length > 0 && (
          <div className="flex gap-1">
            {colors.slice(0, 6).map((c) => (
              <span
                key={c.color}
                className="w-5 h-5 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: c.code }}
                title={c.color}
              />
            ))}
            {colors.length > 6 && (
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                +{colors.length - 6}
              </span>
            )}
          </div>
        )}

        {/* View Product Button */}
        <div
          className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500'
              : 'bg-red-600 text-white group-hover:bg-red-700'
          }`}
        >
          <FaShoppingCart />
          {isOutOfStock ? 'Out of Stock' : 'View Product'}
        </div>
      </div>
    </Link>
  );
}
