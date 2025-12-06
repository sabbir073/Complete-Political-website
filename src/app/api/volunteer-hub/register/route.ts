import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate unique 8-digit volunteer ID
async function generateVolunteerID(): Promise<string> {
  let id: string = '';
  let exists = true;
  let attempts = 0;
  const maxAttempts = 10;

  while (exists && attempts < maxAttempts) {
    // Generate random 8-digit number (10000000 to 99999999)
    id = Math.floor(10000000 + Math.random() * 90000000).toString();

    // Check if already exists in database
    const { data } = await supabase
      .from('volunteers')
      .select('volunteer_id')
      .eq('volunteer_id', id)
      .single();

    exists = !!data;
    attempts++;
  }

  if (exists) {
    throw new Error('Could not generate unique volunteer ID');
  }

  return id;
}

// Validate phone number (Bangladesh format)
function validatePhone(phone: string): boolean {
  // Remove any spaces or dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');
  // Bangladesh phone number: 01XXXXXXXXX (11 digits)
  return /^01[3-9]\d{8}$/.test(cleanPhone);
}

// Valid thanas for Dhaka-18
const validThanas = [
  'uttara_east',
  'uttara_west',
  'turag',
  'dakshinkhan',
  'uttarkhan',
  'khilkhet',
  'airport',
  'vatara'
];

// Valid category keys
const validCategories = [
  'socialActivism',
  'disasterManagement',
  'socialMediaActivism',
  'creativeWriting',
  'itSupport',
  'healthcareSupport',
  'educationTutoring',
  'legalAid',
  'eventManagement',
  'securityDiscipline',
  'transportationLogistics',
  'mediaPhotography',
  'financeAccounting',
  'womensAffairs',
  'youthMobilization'
];

// Valid genders
const validGenders = ['male', 'female', 'other'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      phone,
      age,
      gender,
      thana,
      ward,
      address,
      categories,
      why_sm_jahangir,
      email,
      name_bn,
      photo_url
    } = body;

    // Validate required fields
    if (!name || !phone || !age || !gender || !thana || !ward || !address || !categories || !why_sm_jahangir) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate name
    if (name.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Name must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Validate phone
    if (!validatePhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid Bangladesh phone number (01XXXXXXXXX)' },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const { data: existingVolunteer } = await supabase
      .from('volunteers')
      .select('volunteer_id')
      .eq('phone', phone.replace(/[\s-]/g, ''))
      .single();

    if (existingVolunteer) {
      return NextResponse.json(
        { success: false, error: 'This phone number is already registered' },
        { status: 400 }
      );
    }

    // Validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
      return NextResponse.json(
        { success: false, error: 'Age must be between 16 and 100' },
        { status: 400 }
      );
    }

    // Validate gender
    if (!validGenders.includes(gender)) {
      return NextResponse.json(
        { success: false, error: 'Please select a valid gender' },
        { status: 400 }
      );
    }

    // Validate thana
    if (!validThanas.includes(thana)) {
      return NextResponse.json(
        { success: false, error: 'Please select a valid thana from Dhaka-18' },
        { status: 400 }
      );
    }

    // Validate ward
    if (!ward || ward.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Ward is required' },
        { status: 400 }
      );
    }

    // Validate categories
    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please select at least one category' },
        { status: 400 }
      );
    }

    // Validate each category
    for (const cat of categories) {
      if (!validCategories.includes(cat)) {
        return NextResponse.json(
          { success: false, error: `Invalid category: ${cat}` },
          { status: 400 }
        );
      }
    }

    // Validate why_sm_jahangir
    if (why_sm_jahangir.trim().length < 20) {
      return NextResponse.json(
        { success: false, error: 'Please write at least 20 characters about why S M Jahangir should be MP' },
        { status: 400 }
      );
    }

    // Generate unique volunteer ID
    const volunteerId = await generateVolunteerID();

    // Insert volunteer
    const { data: newVolunteer, error: insertError } = await supabase
      .from('volunteers')
      .insert({
        volunteer_id: volunteerId,
        name: name.trim(),
        name_bn: name_bn?.trim() || null,
        phone: phone.replace(/[\s-]/g, ''),
        email: email?.trim() || null,
        age: ageNum,
        gender,
        thana,
        ward: ward.trim(),
        address: address.trim(),
        categories,
        why_sm_jahangir: why_sm_jahangir.trim(),
        photo_url: photo_url || null,
        status: 'pending',
        is_active: true,
        badges: []
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to register volunteer. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Welcome to the Volunteer Hub.',
      data: {
        volunteer_id: newVolunteer.volunteer_id,
        name: newVolunteer.name,
        thana: newVolunteer.thana,
        ward: newVolunteer.ward,
        categories: newVolunteer.categories,
        status: newVolunteer.status,
        created_at: newVolunteer.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
