'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import MediaPicker from '@/components/media/MediaPicker';
import Image from 'next/image';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaBox, FaTag } from 'react-icons/fa';

interface ProductVariant {
  id?: string;
  size?: string;
  color?: string;
  color_code?: string;
  price_adjustment: number;
  stock: number;
  sku?: string;
  is_active: boolean;
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
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  variants: ProductVariant[];
  created_at: string;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];
const COLORS = [
  { name: 'Red', code: '#EF4444' },
  { name: 'Green', code: '#22C55E' },
  { name: 'Blue', code: '#3B82F6' },
  { name: 'Yellow', code: '#EAB308' },
  { name: 'Black', code: '#000000' },
  { name: 'White', code: '#FFFFFF' },
  { name: 'Gray', code: '#6B7280' },
  { name: 'Navy', code: '#1E3A5F' },
  { name: 'Orange', code: '#F97316' },
  { name: 'Purple', code: '#A855F7' },
];

export default function AdminStoreProductsPage() {
  const { isDark } = useTheme();
  const { showSuccess, showError, showConfirm } = useSweetAlert();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name_en: '',
    name_bn: '',
    description_en: '',
    description_bn: '',
    base_price: 0,
    images: [] as string[],
    is_active: true,
    is_featured: false,
    display_order: 0,
  });

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    size: '',
    color: '',
    color_code: '',
    price_adjustment: 0,
    stock: 0,
    sku: '',
    is_active: true,
  });

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/store/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      showError('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name_en: '',
      name_bn: '',
      description_en: '',
      description_bn: '',
      base_price: 0,
      images: [],
      is_active: true,
      is_featured: false,
      display_order: products.length,
    });
    setVariants([]);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name_en: product.name_en,
      name_bn: product.name_bn || '',
      description_en: product.description_en || '',
      description_bn: product.description_bn || '',
      base_price: product.base_price,
      images: product.images || [],
      is_active: product.is_active,
      is_featured: product.is_featured,
      display_order: product.display_order,
    });
    setVariants(product.variants || []);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setShowVariantForm(false);
  };

  const handleSave = async () => {
    if (!formData.name_en.trim()) {
      showError('Error', 'Product name (English) is required');
      return;
    }

    if (formData.base_price <= 0) {
      showError('Error', 'Base price must be greater than 0');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        variants,
        ...(editingProduct && { id: editingProduct.id }),
      };

      const response = await fetch('/api/admin/store/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save product');
      }

      showSuccess('Success', `Product ${editingProduct ? 'updated' : 'created'} successfully`);
      closeModal();
      fetchProducts();
    } catch (error: any) {
      showError('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = await showConfirm(
      'Delete Product',
      `Are you sure you want to delete "${product.name_en}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/store/products?id=${product.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete product');

      showSuccess('Success', 'Product deleted successfully');
      fetchProducts();
    } catch (error) {
      showError('Error', 'Failed to delete product');
    }
  };

  const addVariant = () => {
    if (!newVariant.size && !newVariant.color) {
      showError('Error', 'Please select at least a size or color');
      return;
    }

    setVariants([...variants, { ...newVariant }]);
    setNewVariant({
      size: '',
      color: '',
      color_code: '',
      price_adjustment: 0,
      stock: 0,
      sku: '',
      is_active: true,
    });
    setShowVariantForm(false);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleImageSelect = (media: any) => {
    if (!media) return;
    // MediaPicker returns MediaItem or MediaItem[] or null
    const mediaItem = Array.isArray(media) ? media[0] : media;
    const url = mediaItem?.cloudfront_url || mediaItem?.s3_url || mediaItem?.url || '';
    if (url && !formData.images.includes(url)) {
      setFormData({ ...formData, images: [...formData.images, url] });
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const getTotalStock = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Products
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your store products and variants
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FaPlus /> Add Product
        </button>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <FaBox className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <h3 className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            No products yet
          </h3>
          <p className={`mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Create your first product to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className={`rounded-lg overflow-hidden shadow-lg ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              {/* Product Image */}
              <div className="relative aspect-square">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name_en}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <FaBox className={`w-16 h-16 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  </div>
                )}
                {/* Status Badges */}
                <div className="absolute top-2 left-2 flex gap-2">
                  {!product.is_active && (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-600 text-white rounded">
                      Inactive
                    </span>
                  )}
                  {product.is_featured && (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-500 text-white rounded">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {product.name_en}
                </h3>
                {product.name_bn && (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {product.name_bn}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xl font-bold text-red-600">
                    ৳{product.base_price.toLocaleString()}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Stock: {getTotalStock(product)}
                  </span>
                </div>

                {/* Variants Preview */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {product.variants.slice(0, 4).map((v, i) => (
                      <span
                        key={i}
                        className={`px-2 py-0.5 text-xs rounded ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {v.size} {v.color && `/ ${v.color}`}
                      </span>
                    ))}
                    {product.variants.length > 4 && (
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        +{product.variants.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div
            className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            {/* Modal Header */}
            <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${
              isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingProduct ? 'Edit Product' : 'Create Product'}
              </h2>
              <button
                onClick={closeModal}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Product Name (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="e.g., BNP T-Shirt"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Product Name (Bengali)
                  </label>
                  <input
                    type="text"
                    value={formData.name_bn}
                    onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="e.g., বিএনপি টি-শার্ট"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description (English)
                  </label>
                  <textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Product description..."
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description (Bengali)
                  </label>
                  <textarea
                    value={formData.description_bn}
                    onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="পণ্যের বিবরণ..."
                  />
                </div>
              </div>

              {/* Price & Order */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Base Price (৳) *
                  </label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                    min="0"
                    step="1"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    min="0"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Featured</span>
                  </label>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Product Images
                </label>
                <div className="flex flex-wrap gap-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative w-24 h-24">
                      <Image
                        src={img}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <MediaPicker
                    value={null}
                    onChange={handleImageSelect}
                    fileType="image"
                    showPreview={false}
                    placeholder="Add Image"
                  />
                </div>
              </div>

              {/* Variants Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Product Variants (Size/Color)
                  </label>
                  <button
                    onClick={() => setShowVariantForm(true)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaPlus className="w-3 h-3" /> Add Variant
                  </button>
                </div>

                {/* Variant Form */}
                {showVariantForm && (
                  <div className={`p-4 rounded-lg mb-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Size</label>
                        <select
                          value={newVariant.size}
                          onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                          className={`w-full px-3 py-2 rounded border text-sm ${
                            isDark
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="">Select Size</option>
                          {SIZES.map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Color</label>
                        <select
                          value={newVariant.color}
                          onChange={(e) => {
                            const color = COLORS.find(c => c.name === e.target.value);
                            setNewVariant({
                              ...newVariant,
                              color: e.target.value,
                              color_code: color?.code || '',
                            });
                          }}
                          className={`w-full px-3 py-2 rounded border text-sm ${
                            isDark
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="">Select Color</option>
                          {COLORS.map((color) => (
                            <option key={color.name} value={color.name}>{color.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Price +/-</label>
                        <input
                          type="number"
                          value={newVariant.price_adjustment}
                          onChange={(e) => setNewVariant({ ...newVariant, price_adjustment: Number(e.target.value) })}
                          className={`w-full px-3 py-2 rounded border text-sm ${
                            isDark
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Stock</label>
                        <input
                          type="number"
                          value={newVariant.stock}
                          onChange={(e) => setNewVariant({ ...newVariant, stock: Number(e.target.value) })}
                          min="0"
                          className={`w-full px-3 py-2 rounded border text-sm ${
                            isDark
                              ? 'bg-gray-600 border-gray-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={addVariant}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowVariantForm(false)}
                        className={`px-4 py-2 text-sm rounded-lg ${
                          isDark ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Variants List */}
                {variants.length > 0 ? (
                  <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <table className="w-full">
                      <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                          <th className={`px-4 py-2 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Size</th>
                          <th className={`px-4 py-2 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Color</th>
                          <th className={`px-4 py-2 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Price Adj.</th>
                          <th className={`px-4 py-2 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Stock</th>
                          <th className={`px-4 py-2 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Final Price</th>
                          <th className={`px-4 py-2 text-center text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Action</th>
                        </tr>
                      </thead>
                      <tbody className={isDark ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                        {variants.map((variant, index) => (
                          <tr key={index}>
                            <td className={`px-4 py-2 text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                              {variant.size || '-'}
                            </td>
                            <td className={`px-4 py-2 text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                              <div className="flex items-center gap-2">
                                {variant.color_code && (
                                  <span
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: variant.color_code }}
                                  />
                                )}
                                {variant.color || '-'}
                              </div>
                            </td>
                            <td className={`px-4 py-2 text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                              {variant.price_adjustment >= 0 ? '+' : ''}৳{variant.price_adjustment}
                            </td>
                            <td className={`px-4 py-2 text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                              {variant.stock}
                            </td>
                            <td className={`px-4 py-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                              ৳{formData.base_price + variant.price_adjustment}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                onClick={() => removeVariant(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={`text-sm text-center py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    No variants added. Add variants for different sizes and colors.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t ${
              isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
