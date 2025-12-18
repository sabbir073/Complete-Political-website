'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useCart } from '@/stores/cart';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FaShoppingBag, FaShoppingCart, FaArrowLeft, FaMinus, FaPlus, FaCheck, FaTruck } from 'react-icons/fa';

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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const { addItem, items } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchProduct(params.slug as string);
    }
  }, [params.slug]);

  const fetchProduct = async (slug: string) => {
    try {
      const response = await fetch(`/api/store/products?slug=${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Product not found');
        } else {
          throw new Error('Failed to fetch product');
        }
        return;
      }
      const data = await response.json();
      setProduct(data);

      // Auto-select first available size and color
      if (data.variants && data.variants.length > 0) {
        const availableSizes = getUniqueSizes(data.variants);
        const availableColors = getUniqueColors(data.variants);
        if (availableSizes.length > 0) setSelectedSize(availableSizes[0]);
        if (availableColors.length > 0) setSelectedColor(availableColors[0].color);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const getText = (en?: string, bn?: string) => {
    return language === 'bn' && bn ? bn : en || '';
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

  const getSelectedVariant = (): ProductVariant | null => {
    if (!product?.variants) return null;

    return product.variants.find(v => {
      const sizeMatch = !selectedSize || v.size === selectedSize;
      const colorMatch = !selectedColor || v.color === selectedColor;
      return sizeMatch && colorMatch;
    }) || null;
  };

  const getPrice = () => {
    if (!product) return 0;
    const variant = getSelectedVariant();
    return product.base_price + (variant?.price_adjustment || 0);
  };

  const getStock = () => {
    const variant = getSelectedVariant();
    return variant?.stock || 0;
  };

  const isOutOfStock = getStock() === 0;

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;

    const variant = getSelectedVariant();
    const variantInfo = [
      selectedSize && `Size: ${selectedSize}`,
      selectedColor && `Color: ${selectedColor}`,
    ].filter(Boolean).join(', ');

    addItem({
      product_id: product.id,
      variant_id: variant?.id || null,
      product_name: getText(product.name_en, product.name_bn),
      variant_info: variantInfo || undefined,
      unit_price: getPrice(),
      quantity,
      image: product.images?.[0],
    });

    setAddedToCart(true);
    // Redirect to cart after brief delay to show success state
    setTimeout(() => {
      router.push('/store/cart');
    }, 500);
  };

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <FaShoppingBag className={`w-20 h-20 mb-6 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {error || 'Product Not Found'}
        </h1>
        <Link
          href="/store"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <FaArrowLeft /> Back to Store
        </Link>
      </div>
    );
  }

  const uniqueSizes = getUniqueSizes(product.variants || []);
  const uniqueColors = getUniqueColors(product.variants || []);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header with Cart */}
      <div className={`sticky top-0 z-40 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/store"
            className={`flex items-center gap-2 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <FaArrowLeft /> {language === 'bn' ? 'স্টোরে ফিরুন' : 'Back to Store'}
          </Link>
          <Link
            href="/store/cart"
            className="relative flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FaShoppingCart />
            {language === 'bn' ? 'কার্ট' : 'Cart'}
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-500 text-xs font-bold rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name_en}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${
                  isDark ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <FaShoppingBag className={`w-32 h-32 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-red-600 ring-2 ring-red-600/30'
                        : isDark ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name_en} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {getText(product.name_en, product.name_bn)}
              </h1>
              <p className="text-4xl font-bold text-red-600">
                ৳{getPrice().toLocaleString()}
              </p>
              {getSelectedVariant()?.price_adjustment !== 0 && (
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Base price: ৳{product.base_price.toLocaleString()}
                </p>
              )}
            </div>

            {/* Description */}
            {(product.description_en || product.description_bn) && (
              <div>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {getText(product.description_en, product.description_bn)}
                </p>
              </div>
            )}

            {/* Size Selection */}
            {uniqueSizes.length > 0 && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {language === 'bn' ? 'সাইজ নির্বাচন করুন' : 'Select Size'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                        selectedSize === size
                          ? 'border-red-600 bg-red-600 text-white'
                          : isDark
                            ? 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {uniqueColors.length > 0 && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {language === 'bn' ? 'রং নির্বাচন করুন' : 'Select Color'}: {selectedColor}
                </label>
                <div className="flex flex-wrap gap-3">
                  {uniqueColors.map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setSelectedColor(c.color)}
                      className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === c.color
                          ? 'border-red-600 ring-2 ring-red-600/30'
                          : isDark ? 'border-gray-600' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: c.code }}
                      title={c.color}
                    >
                      {selectedColor === c.color && (
                        <FaCheck className={`absolute inset-0 m-auto w-4 h-4 ${
                          c.code === '#FFFFFF' || c.code === '#EAB308' ? 'text-gray-800' : 'text-white'
                        }`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Info */}
            <div className={`flex items-center gap-2 text-sm ${
              isOutOfStock
                ? 'text-red-500'
                : getStock() < 10
                  ? 'text-yellow-500'
                  : isDark ? 'text-green-400' : 'text-green-600'
            }`}>
              {isOutOfStock ? (
                <span>{language === 'bn' ? 'স্টক নেই' : 'Out of Stock'}</span>
              ) : getStock() < 10 ? (
                <span>{language === 'bn' ? `মাত্র ${getStock()}টি বাকি` : `Only ${getStock()} left`}</span>
              ) : (
                <span>{language === 'bn' ? 'স্টকে আছে' : 'In Stock'}</span>
              )}
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {language === 'bn' ? 'পরিমাণ' : 'Quantity'}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      quantity <= 1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isDark
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaMinus />
                  </button>
                  <span className={`w-12 text-center text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(getStock(), quantity + 1))}
                    disabled={quantity >= getStock()}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      quantity >= getStock()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isDark
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addedToCart}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-lg font-bold transition-all ${
                isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : addedToCart
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]'
              }`}
            >
              {addedToCart ? (
                <>
                  <FaCheck className="w-5 h-5" />
                  {language === 'bn' ? 'কার্টে যোগ হয়েছে!' : 'Added to Cart!'}
                </>
              ) : isOutOfStock ? (
                <>
                  {language === 'bn' ? 'স্টক নেই' : 'Out of Stock'}
                </>
              ) : (
                <>
                  <FaShoppingCart className="w-5 h-5" />
                  {language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'} - ৳{(getPrice() * quantity).toLocaleString()}
                </>
              )}
            </button>

            {/* Delivery Info */}
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <FaTruck className={`w-5 h-5 mt-0.5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {language === 'bn'
                    ? 'ঢাকা-১৮ এলাকায় ডেলিভারি পাওয়া যায়'
                    : 'Available for Dhaka-18 area'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
