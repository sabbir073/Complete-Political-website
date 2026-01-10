'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface VoterMetadata {
  id: string;
  area?: string;
  district: string;
  upazila_thana: string;
  cc_pourosova?: string;
  union_pouro_ward_cant_board?: string;
  ward_no_for_union?: string;
  voter_area_name: string;
  voter_area_no: string;
  post_office?: string;
  postal_code?: string;
  total_voter: string;  // Changed to string for Bengali numerals
  total_female_voter: string;  // Changed to string for Bengali numerals
  total_male_voter: string;  // Changed to string for Bengali numerals
  voter_list_announce_date: string;
  created_at: string;
  updated_at?: string;
  voter_list?: Array<{ count: number }>;
}

export default function VoterMetadataPage() {
  const { language } = useLanguage();
  const [metadata, setMetadata] = useState<VoterMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<VoterMetadata>>({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/voter-metadata');
      if (!response.ok) throw new Error('Failed to fetch metadata');

      const data = await response.json();
      setMetadata(data.metadata);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: VoterMetadata) => {
    setEditingId(item.id);
    // Remove voter_list from formData as it's not a column in voter_metadata
    const { voter_list, ...editData } = item;
    setFormData(editData);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) return;

    try {
      const response = await fetch(`/api/admin/voter-metadata?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      fetchMetadata();
    } catch (error) {
      console.error('Error deleting metadata:', error);
      alert(language === 'bn' ? 'মুছে ফেলা ব্যর্থ হয়েছে' : 'Failed to delete');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = '/api/admin/voter-metadata';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save');

      setShowForm(false);
      setEditingId(null);
      setFormData({});
      fetchMetadata();
    } catch (error) {
      console.error('Error saving metadata:', error);
      alert(language === 'bn' ? 'সংরক্ষণ ব্যর্থ হয়েছে' : 'Failed to save');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US');
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'bn' ? 'ভোটার মেটাডেটা' : 'Voter Metadata'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'bn'
              ? 'ভোটার এলাকার তথ্য পরিচালনা করুন'
              : 'Manage voter area information'}
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({});
          }}
          className="px-6 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#c2303c] transition-colors"
        >
          {language === 'bn' ? '+ নতুন যোগ করুন' : '+ Add New'}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {editingId
                ? (language === 'bn' ? 'সম্পাদনা করুন' : 'Edit Metadata')
                : (language === 'bn' ? 'নতুন যোগ করুন' : 'Add New Metadata')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* এলাকা */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    এলাকা
                  </label>
                  <input
                    type="text"
                    value={formData.area || ''}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* জেলা */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    জেলা <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.district || ''}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                {/* উপজেলা/থানা */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    উপজেলা/থানা <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.upazila_thana || ''}
                    onChange={(e) => setFormData({ ...formData, upazila_thana: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                {/* সিটি কর্পোরেশন/ পৌরসভা */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    সিটি কর্পোরেশন/ পৌরসভা
                  </label>
                  <input
                    type="text"
                    value={formData.cc_pourosova || ''}
                    onChange={(e) => setFormData({ ...formData, cc_pourosova: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* ইউনিয়ন/ পৌর ওয়ার্ড/ ক্যান্টনমেন্ট বোর্ড */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ইউনিয়ন/ পৌর ওয়ার্ড/ ক্যান্টনমেন্ট বোর্ড
                  </label>
                  <input
                    type="text"
                    value={formData.union_pouro_ward_cant_board || ''}
                    onChange={(e) => setFormData({ ...formData, union_pouro_ward_cant_board: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* ওয়ার্ড নম্বর (ইউনিয়ন পরিষদের জন্য) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ওয়ার্ড নম্বর (ইউনিয়ন পরিষদের জন্য)
                  </label>
                  <input
                    type="text"
                    value={formData.ward_no_for_union || ''}
                    onChange={(e) => setFormData({ ...formData, ward_no_for_union: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* ভোটার এলাকার নাম */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ভোটার এলাকার নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.voter_area_name || ''}
                    onChange={(e) => setFormData({ ...formData, voter_area_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                {/* ভোটার এলাকার নম্বর */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ভোটার এলাকার নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.voter_area_no || ''}
                    onChange={(e) => setFormData({ ...formData, voter_area_no: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                {/* ডাকঘর */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ডাকঘর
                  </label>
                  <input
                    type="text"
                    value={formData.post_office || ''}
                    onChange={(e) => setFormData({ ...formData, post_office: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* পোস্ট কোড */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    পোস্ট কোড
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code || ''}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* সর্বমোট ভোটার সংখ্যা */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    সর্বমোট ভোটার সংখ্যা <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.total_voter || ''}
                    onChange={(e) => setFormData({ ...formData, total_voter: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="উদাহরণ: ১০২৮৮"
                    required
                  />
                </div>

                {/* মোট মহিলা ভোটার সংখ্যা */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    মোট মহিলা ভোটার সংখ্যা <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.total_female_voter || ''}
                    onChange={(e) => setFormData({ ...formData, total_female_voter: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="উদাহরণ: ৪৮১৪"
                    required
                  />
                </div>

                {/* মোট পুরুষ ভোটার সংখ্যা */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    মোট পুরুষ ভোটার সংখ্যা <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.total_male_voter || ''}
                    onChange={(e) => setFormData({ ...formData, total_male_voter: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="উদাহরণ: ৫৪৭৪"
                    required
                  />
                </div>

                {/* ভোটার তালিকা ঘোষণার তারিখ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ভোটার তালিকা ঘোষণার তারিখ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.voter_list_announce_date || ''}
                    onChange={(e) => setFormData({ ...formData, voter_list_announce_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({});
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#E63946] text-white rounded-lg hover:bg-[#c2303c] transition-colors"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Metadata Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'bn' ? 'এলাকা' : 'Area'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'bn' ? 'ভোটার সংখ্যা' : 'Voter Count'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'bn' ? 'তালিকায় আছে' : 'In List'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'bn' ? 'তারিখ' : 'Date'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {language === 'bn' ? 'অ্যাকশন' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
                  </td>
                </tr>
              ) : metadata.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {language === 'bn' ? 'কোন ডেটা পাওয়া যায়নি' : 'No data found'}
                  </td>
                </tr>
              ) : (
                metadata.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                      {item.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div className="font-medium">{item.voter_area_name}</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {item.district}, {item.upazila_thana}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div>{language === 'bn' ? 'মোট' : 'Total'}: {item.total_voter}</div>
                      <div className="text-xs">
                        {language === 'bn' ? 'মহিলা' : 'Female'}: {item.total_female_voter} | {' '}
                        {language === 'bn' ? 'পুরুষ' : 'Male'}: {item.total_male_voter}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-600 dark:text-primary-400">
                      {item.voter_list?.[0]?.count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(item.voter_list_announce_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        {language === 'bn' ? 'সম্পাদনা' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        {language === 'bn' ? 'মুছুন' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
