import { NextRequest, NextResponse } from 'next/server';

// Proxy endpoint to fetch images and return as base64
// This avoids CORS issues when using html2canvas
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL is from our allowed domains (S3/CloudFront)
    const allowedPatterns = [
      // CloudFront domains
      process.env.AWS_CLOUDFRONT_DOMAIN,
      process.env.NEXT_PUBLIC_CLOUDFRONT_URL,
      // S3 bucket domains
      process.env.AWS_S3_BUCKET_NAME ? `${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com` : null,
      process.env.AWS_S3_BUCKET_NAME ? `${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com` : null,
      // Common CloudFront pattern - allow any cloudfront.net subdomain
      'cloudfront.net',
      // S3 pattern
      's3.amazonaws.com',
    ].filter(Boolean) as string[];

    const urlObj = new URL(url);
    const isAllowed = allowedPatterns.some(pattern => {
      const cleanPattern = pattern.replace(/^https?:\/\//, '').split('/')[0];
      return urlObj.hostname.includes(cleanPattern) || urlObj.hostname.endsWith(cleanPattern);
    });

    if (!isAllowed) {
      console.error('Image proxy - URL not allowed:', url, 'Hostname:', urlObj.hostname);
      return NextResponse.json(
        { success: false, error: 'URL not allowed' },
        { status: 403 }
      );
    }

    // Fetch the image
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch image' },
        { status: 500 }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      dataUrl
    });

  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
