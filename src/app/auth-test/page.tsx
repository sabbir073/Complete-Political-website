/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from 'react';
import { useAuth, useAuthActions } from '@/stores/auth-enterprise';
import { createClient } from '@/lib/supabase/client';

export default function AuthTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const { user, profile, isAuthenticated, initialized, loading } = useAuth();
  const { initialize } = useAuthActions();

  const addResult = (message: string) => {
    console.log(message);
    setTestResults(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    const runTests = async () => {
      addResult('🚀 Starting auth tests...');
      
      try {
        // Test 1: Check environment variables
        addResult(`🔍 SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing'}`);
        addResult(`🔍 SUPABASE_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'}`);
        
        // Test 2: Create Supabase client
        addResult('📱 Creating Supabase client...');
        const supabase = createClient();
        addResult('✅ Supabase client created');
        
        // Test 3: Direct session check
        addResult('📋 Testing direct session check...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          addResult(`❌ Direct session error: ${error.message}`);
        } else {
          addResult(`✅ Direct session check complete. Has session: ${!!session}`);
          if (session) {
            addResult(`👤 Direct session user: ${session.user.email}`);
          }
        }
        
        // Test 4: Check auth store state
        addResult(`🏪 Auth store state - initialized: ${initialized}, loading: ${loading}, isAuthenticated: ${isAuthenticated}`);
        
        // Test 5: Try manual initialization
        addResult('🔧 Attempting manual auth initialization...');
        await initialize();
        addResult('✅ Manual initialization completed');
        
      } catch (error: any) {
        addResult(`💥 Test error: ${error.message}`);
      }
    };

    runTests();
  }, [initialize, initialized, loading, isAuthenticated]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Auth Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Current Auth State:</h2>
        <ul>
          <li><strong>Initialized:</strong> {String(initialized)}</li>
          <li><strong>Loading:</strong> {String(loading)}</li>
          <li><strong>Is Authenticated:</strong> {String(isAuthenticated)}</li>
          <li><strong>User:</strong> {user?.email || 'None'}</li>
          <li><strong>Profile:</strong> {profile?.full_name || 'None'}</li>
          <li><strong>Role:</strong> {profile?.role || 'None'}</li>
          <li><strong>Active:</strong> {String(profile?.is_active)}</li>
        </ul>
      </div>
      
      <div>
        <h2>Test Results:</h2>
        <div style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          borderRadius: '5px',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          {testResults.map((result, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              {result}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
          Go to Login Page
        </a>
      </div>
    </div>
  );
}