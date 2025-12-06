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

// GET - List all volunteers with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const thana = searchParams.get('thana');
    const ward = searchParams.get('ward');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('volunteers')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (thana) {
      query = query.eq('thana', thana);
    }
    if (ward) {
      query = query.eq('ward', ward);
    }
    if (category) {
      query = query.contains('categories', [category]);
    }
    if (search) {
      query = query.or(`volunteer_id.ilike.%${search}%,name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: volunteers, error, count } = await query;

    if (error) {
      console.error('Error fetching volunteers:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch volunteers' },
        { status: 500 }
      );
    }

    // Transform data with labels
    const transformedVolunteers = (volunteers || []).map(volunteer => ({
      ...volunteer,
      thana_label: thanaLabels[volunteer.thana] || { en: volunteer.thana, bn: volunteer.thana },
      categories_with_labels: (volunteer.categories || []).map((cat: string) => ({
        key: cat,
        label: categoryLabels[cat] || { en: cat, bn: cat }
      }))
    }));

    return NextResponse.json({
      success: true,
      volunteers: transformedVolunteers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
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

// PATCH - Update volunteer (verify, edit, assign badge)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Volunteer ID is required' },
        { status: 400 }
      );
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case 'verify':
        updateData = {
          status: 'verified',
          verified_at: new Date().toISOString(),
        };
        break;

      case 'reject':
        updateData = {
          status: 'rejected',
        };
        break;

      case 'suspend':
        updateData = {
          status: 'suspended',
        };
        break;

      case 'reactivate':
        updateData = {
          status: 'pending',
        };
        break;

      case 'assign_badge':
        if (!data?.badge) {
          return NextResponse.json(
            { success: false, error: 'Badge data is required' },
            { status: 400 }
          );
        }
        // Get current badges
        const { data: currentVolunteer } = await supabase
          .from('volunteers')
          .select('badges')
          .eq('id', id)
          .single();

        const currentBadges = currentVolunteer?.badges || [];
        // Check if badge already exists
        if (!currentBadges.some((b: { key: string }) => b.key === data.badge.key)) {
          updateData = {
            badges: [...currentBadges, { ...data.badge, assigned_at: new Date().toISOString() }]
          };
        } else {
          return NextResponse.json(
            { success: false, error: 'Badge already assigned' },
            { status: 400 }
          );
        }
        break;

      case 'remove_badge':
        if (!data?.badgeKey) {
          return NextResponse.json(
            { success: false, error: 'Badge key is required' },
            { status: 400 }
          );
        }
        const { data: vol } = await supabase
          .from('volunteers')
          .select('badges')
          .eq('id', id)
          .single();

        const badges = (vol?.badges || []).filter((b: { key: string }) => b.key !== data.badgeKey);
        updateData = { badges };
        break;

      case 'update':
        // General update
        const allowedFields = ['name', 'name_bn', 'phone', 'age', 'gender', 'thana', 'ward', 'address', 'categories', 'admin_notes', 'photo_url', 'is_active'];
        allowedFields.forEach(field => {
          if (data?.[field] !== undefined) {
            updateData[field] = data[field];
          }
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    const { data: updatedVolunteer, error } = await supabase
      .from('volunteers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating volunteer:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update volunteer' },
        { status: 500 }
      );
    }

    // Transform data with labels
    const transformedVolunteer = {
      ...updatedVolunteer,
      thana_label: thanaLabels[updatedVolunteer.thana] || { en: updatedVolunteer.thana, bn: updatedVolunteer.thana },
      categories_with_labels: (updatedVolunteer.categories || []).map((cat: string) => ({
        key: cat,
        label: categoryLabels[cat] || { en: cat, bn: cat }
      }))
    };

    return NextResponse.json({
      success: true,
      volunteer: transformedVolunteer,
      message: `Volunteer ${action === 'verify' ? 'verified' : action === 'reject' ? 'rejected' : 'updated'} successfully`
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE - Delete volunteer
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Volunteer ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('volunteers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting volunteer:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete volunteer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Volunteer deleted successfully'
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
