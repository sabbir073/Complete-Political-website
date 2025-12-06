import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

// Gender labels for display
const genderLabels: Record<string, { en: string; bn: string }> = {
  male: { en: 'Male', bn: 'পুরুষ' },
  female: { en: 'Female', bn: 'মহিলা' },
  other: { en: 'Other', bn: 'অন্যান্য' }
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Volunteer ID is required' },
        { status: 400 }
      );
    }

    // Validate ID format (8 digits)
    if (!/^\d{8}$/.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 8-digit Volunteer ID' },
        { status: 400 }
      );
    }

    // Search for volunteer
    const { data: volunteer, error } = await supabase
      .from('volunteers')
      .select('volunteer_id, name, name_bn, gender, thana, ward, categories, badges, status, created_at, photo_url')
      .eq('volunteer_id', id)
      .eq('is_active', true)
      .single();

    if (error || !volunteer) {
      return NextResponse.json(
        { success: false, error: 'No volunteer found with this ID' },
        { status: 404 }
      );
    }

    // Return LIMITED public info only (no phone, address, or personal details)
    return NextResponse.json({
      success: true,
      volunteer: {
        volunteer_id: volunteer.volunteer_id,
        name: volunteer.name,
        name_bn: volunteer.name_bn,
        gender: volunteer.gender ? {
          key: volunteer.gender,
          label: genderLabels[volunteer.gender] || { en: volunteer.gender, bn: volunteer.gender }
        } : null,
        thana: {
          key: volunteer.thana,
          label: thanaLabels[volunteer.thana] || { en: volunteer.thana, bn: volunteer.thana }
        },
        ward: volunteer.ward,
        categories: (volunteer.categories || []).map((cat: string) => ({
          key: cat,
          label: categoryLabels[cat] || { en: cat, bn: cat }
        })),
        badges: volunteer.badges || [],
        status: volunteer.status,
        member_since: volunteer.created_at,
        photo_url: volunteer.photo_url
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
