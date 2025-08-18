import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';
const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN || '';

// Upload file to S3
export async function uploadToS3(file: Buffer, key: string, contentType: string) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      CacheControl: 'max-age=31536000', // 1 year cache
      // Note: ACL removed - bucket should be configured with bucket policy for public access
      Metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    // Generate URLs
    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    // Handle CloudFront URL - check if domain already has protocol
    const cloudFrontUrl = CLOUDFRONT_DOMAIN 
      ? (CLOUDFRONT_DOMAIN.startsWith('http') 
          ? `${CLOUDFRONT_DOMAIN}/${key}` 
          : `https://${CLOUDFRONT_DOMAIN}/${key}`)
      : s3Url;

    return {
      s3Url,
      cloudFrontUrl,
      success: true,
    };
  } catch (error) {
    return {
      s3Url: null,
      cloudFrontUrl: null,
      success: false,
      error: `S3 Error: ${error instanceof Error ? error.name : 'Unknown'} - ${error instanceof Error ? error.message : 'Upload failed'}`,
    };
  }
}

// Delete file from S3
export async function deleteFromS3(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    console.error('S3 Delete Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

// Generate presigned URL for secure upload (alternative method)
export async function getPresignedUploadUrl(key: string, contentType: string) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    return { signedUrl, success: true };
  } catch (error) {
    console.error('Presigned URL Error:', error);
    return {
      signedUrl: null,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate upload URL',
    };
  }
}

// Validate AWS configuration
export function validateAWSConfig() {
  const requiredVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY', 
    'AWS_REGION',
    'AWS_S3_BUCKET_NAME'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing AWS configuration: ${missing.join(', ')}`);
  }

  return true;
}