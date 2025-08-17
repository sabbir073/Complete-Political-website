/* eslint-disable @typescript-eslint/no-unused-vars */
// 🏥 ENTERPRISE HEALTH CHECK
// Simple endpoint to verify the system is working

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Enterprise User Management API',
      version: '1.0.0',
      message: 'System operational'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'System error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}