import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Thana labels for display
const thanaLabels: Record<string, { en: string; bn: string }> = {
  uttara_east: { en: 'Uttara East', bn: 'উত্তরা পূর্ব' },
  uttara_west: { en: 'Uttara West', bn: 'উত্তরা পশ্চিম' },
  turag: { en: 'Turag', bn: 'তুরাগ' },
  dakshinkhan: { en: 'Dakshinkhan', bn: 'দক্ষিণখান' },
  uttarkhan: { en: 'Uttarkhan', bn: 'উত্তরখান' },
  khilkhet: { en: 'Khilkhet', bn: 'খিলক্ষেত' },
  airport: { en: 'Airport', bn: 'বিমানবন্দর' },
  vatara: { en: 'Vatara', bn: 'ভাটারা' }
};

// Category labels for display
const categoryLabels: Record<string, { en: string; bn: string }> = {
  socialActivism: { en: 'Social Activism', bn: 'সামাজিক সক্রিয়তা' },
  disasterManagement: { en: 'Disaster Management', bn: 'দুর্যোগ ব্যবস্থাপনা' },
  socialMediaActivism: { en: 'Social Media Activism', bn: 'সোশ্যাল মিডিয়া সক্রিয়তা' },
  creativeWriting: { en: 'Creative Writing', bn: 'সৃজনশীল লেখালেখি' },
  itSupport: { en: 'IT Support', bn: 'আইটি সহায়তা' },
  healthcareSupport: { en: 'Healthcare Support', bn: 'স্বাস্থ্যসেবা সহায়তা' },
  educationTutoring: { en: 'Education & Tutoring', bn: 'শিক্ষা ও টিউটরিং' },
  legalAid: { en: 'Legal Aid', bn: 'আইনি সহায়তা' },
  eventManagement: { en: 'Event Management', bn: 'ইভেন্ট ম্যানেজমেন্ট' },
  securityDiscipline: { en: 'Security & Discipline', bn: 'নিরাপত্তা ও শৃঙ্খলা' },
  transportationLogistics: { en: 'Transportation & Logistics', bn: 'পরিবহন ও লজিস্টিক্স' },
  mediaPhotography: { en: 'Media & Photography', bn: 'মিডিয়া ও ফটোগ্রাফি' },
  financeAccounting: { en: 'Finance & Accounting', bn: 'অর্থ ও হিসাব' },
  womensAffairs: { en: "Women's Affairs", bn: 'নারী বিষয়ক' },
  youthMobilization: { en: 'Youth Mobilization', bn: 'যুব সংগঠন' }
};

export async function GET() {
  try {
    // Get all volunteers (for statistics)
    const { data: volunteers, error } = await supabase
      .from('volunteers')
      .select('status, thana, ward, categories, is_active')
      .eq('is_active', true);

    if (error) {
      console.error('Stats fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    // Calculate totals
    const total = volunteers?.length || 0;
    const verified = volunteers?.filter(v => v.status === 'verified').length || 0;
    const pending = volunteers?.filter(v => v.status === 'pending').length || 0;

    // Calculate thana-wise stats
    const thanaStats: Record<string, { total: number; verified: number }> = {};
    for (const thanaKey of Object.keys(thanaLabels)) {
      const thanaVolunteers = volunteers?.filter(v => v.thana === thanaKey) || [];
      thanaStats[thanaKey] = {
        total: thanaVolunteers.length,
        verified: thanaVolunteers.filter(v => v.status === 'verified').length
      };
    }

    // Calculate ward-wise stats
    const wardStats: Record<string, number> = {};
    volunteers?.forEach(v => {
      if (v.ward) {
        wardStats[v.ward] = (wardStats[v.ward] || 0) + 1;
      }
    });

    // Calculate category-wise stats
    const categoryStats: Record<string, number> = {};
    volunteers?.forEach(v => {
      if (Array.isArray(v.categories)) {
        v.categories.forEach((cat: string) => {
          categoryStats[cat] = (categoryStats[cat] || 0) + 1;
        });
      }
    });

    // Count unique thanas with volunteers
    const activeThanas = Object.values(thanaStats).filter(s => s.total > 0).length;

    return NextResponse.json({
      success: true,
      stats: {
        total,
        verified,
        pending,
        activeThanas,
        byThana: Object.entries(thanaStats).map(([key, value]) => ({
          key,
          label: thanaLabels[key],
          ...value
        })),
        byWard: Object.entries(wardStats)
          .map(([ward, count]) => ({ ward, count }))
          .sort((a, b) => b.count - a.count),
        byCategory: Object.entries(categoryStats)
          .map(([key, count]) => ({
            key,
            label: categoryLabels[key],
            count
          }))
          .sort((a, b) => b.count - a.count)
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
