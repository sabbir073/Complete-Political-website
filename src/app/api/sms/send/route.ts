import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message } = body;

    // Validate phone number (Bangladesh format)
    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'সঠিক বাংলাদেশী মোবাইল নম্বর দিন' },
        { status: 400 }
      );
    }

    // Get SMS credentials from environment
    const smsApiKey = process.env.SMS_API_KEY;
    const smsSenderId = process.env.SMS_SENDER_ID;
    const smsApiUrl = process.env.SMS_API_URL;

    if (!smsApiKey || !smsSenderId || !smsApiUrl) {
      console.error('SMS credentials not configured');
      return NextResponse.json(
        { error: 'এসএমএস সার্ভিস কনফিগার করা হয়নি' },
        { status: 500 }
      );
    }

    // Format phone with country code
    const formattedPhone = cleanPhone.startsWith('0')
      ? `88${cleanPhone}`
      : cleanPhone;

    // Send SMS using the configured provider
    // This is a generic implementation - adjust based on your SMS provider
    const response = await fetch(smsApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${smsApiKey}`,
      },
      body: JSON.stringify({
        api_key: smsApiKey,
        sender_id: smsSenderId,
        to: formattedPhone,
        message: message,
        type: 'unicode', // For Bengali text
      }),
    });

    const data = await response.json();

    if (response.ok && (data.status === 'success' || data.status_code === 200)) {
      return NextResponse.json({
        success: true,
        message: 'এসএমএস সফলভাবে পাঠানো হয়েছে',
      });
    } else {
      console.error('SMS API error:', data);
      return NextResponse.json(
        { error: data.message || 'এসএমএস পাঠাতে সমস্যা হয়েছে' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('SMS send error:', error);
    return NextResponse.json(
      { error: 'এসএমএস পাঠাতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
