import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Thana labels
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

// Category labels
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
    // Get all active volunteers
    const { data: volunteers, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching volunteers:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    const allVolunteers = volunteers || [];

    // Calculate statistics
    const total = allVolunteers.length;
    const verified = allVolunteers.filter(v => v.status === 'verified').length;
    const pending = allVolunteers.filter(v => v.status === 'pending').length;
    const suspended = allVolunteers.filter(v => v.status === 'suspended').length;
    const rejected = allVolunteers.filter(v => v.status === 'rejected').length;

    // Thana-wise breakdown
    const thanaStats: Record<string, { total: number; verified: number; pending: number }> = {};
    Object.keys(thanaLabels).forEach(thana => {
      const thanaVolunteers = allVolunteers.filter(v => v.thana === thana);
      thanaStats[thana] = {
        total: thanaVolunteers.length,
        verified: thanaVolunteers.filter(v => v.status === 'verified').length,
        pending: thanaVolunteers.filter(v => v.status === 'pending').length
      };
    });

    // Ward-wise breakdown
    const wardStats: Record<string, { total: number; verified: number }> = {};
    allVolunteers.forEach(v => {
      if (!wardStats[v.ward]) {
        wardStats[v.ward] = { total: 0, verified: 0 };
      }
      wardStats[v.ward].total++;
      if (v.status === 'verified') {
        wardStats[v.ward].verified++;
      }
    });

    // Category-wise breakdown
    const categoryStats: Record<string, number> = {};
    Object.keys(categoryLabels).forEach(cat => {
      categoryStats[cat] = allVolunteers.filter(v =>
        v.categories && v.categories.includes(cat)
      ).length;
    });

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = allVolunteers.filter(
      v => new Date(v.created_at) >= sevenDaysAgo
    ).length;

    // Registration trend (last 30 days, by day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const registrationTrend: Record<string, number> = {};

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      registrationTrend[dateStr] = 0;
    }

    allVolunteers.forEach(v => {
      const dateStr = v.created_at.split('T')[0];
      if (registrationTrend[dateStr] !== undefined) {
        registrationTrend[dateStr]++;
      }
    });

    // Get recent 10 volunteers pending verification
    const pendingVolunteers = allVolunteers
      .filter(v => v.status === 'pending')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(v => ({
        id: v.id,
        volunteer_id: v.volunteer_id,
        name: v.name,
        phone: v.phone,
        thana: v.thana,
        thana_label: thanaLabels[v.thana] || { en: v.thana, bn: v.thana },
        created_at: v.created_at
      }));

    return NextResponse.json({
      success: true,
      stats: {
        overview: {
          total,
          verified,
          pending,
          suspended,
          rejected,
          recentRegistrations
        },
        byThana: Object.entries(thanaStats).map(([key, value]) => ({
          key,
          label: thanaLabels[key],
          ...value
        })),
        byWard: Object.entries(wardStats)
          .map(([key, value]) => ({
            ward: key,
            ...value
          }))
          .sort((a, b) => b.total - a.total),
        byCategory: Object.entries(categoryStats)
          .map(([key, count]) => ({
            key,
            label: categoryLabels[key],
            count
          }))
          .sort((a, b) => b.count - a.count),
        registrationTrend: Object.entries(registrationTrend)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        pendingVolunteers
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
