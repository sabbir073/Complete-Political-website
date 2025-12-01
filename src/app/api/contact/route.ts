import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/contact - Submit contact form (public)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const { name, email, phone, subject, message } = body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Name, email, subject, and message are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Insert contact submission
        const { data, error } = await supabase
            .from('contact_submissions')
            .insert({
                name,
                email,
                phone: phone || null,
                subject,
                message,
                status: 'pending',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating contact submission:', error);
            return NextResponse.json(
                { error: 'Failed to submit contact form' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Contact form submitted successfully',
            data,
        });
    } catch (error) {
        console.error('Error in POST /api/contact:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
