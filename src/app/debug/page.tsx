"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DebugPage() {
  const [status, setStatus] = useState('Loading...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    const runTests = async () => {
      try {
        addLog('🚀 Starting debug tests...');
        
        // Test 1: Create Supabase client
        addLog('📱 Creating Supabase client...');
        const supabase = createClient();
        addLog('✅ Supabase client created');
        
        // Test 2: Check environment variables
        addLog('🔍 Checking environment variables...');
        addLog(`SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing'}`);
        addLog(`SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'}`);
        
        // Test 3: Get session
        addLog('📋 Getting session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          addLog(`❌ Session error: ${error.message}`);
        } else {
          addLog(`✅ Session check complete. Has session: ${!!session}`);
          if (session) {
            addLog(`👤 User: ${session.user.email}`);
          }
        }
        
        // Test 4: Test API endpoint
        addLog('🌐 Testing API endpoint...');
        try {
          const response = await fetch('/api/admin/users');
          addLog(`📡 API Response status: ${response.status}`);
          if (response.ok) {
            const data = await response.json();
            addLog(`📊 API Response: ${JSON.stringify(data).substring(0, 100)}...`);
          }
        } catch (apiError: any) {
          addLog(`❌ API Error: ${apiError.message}`);
        }
        
        setStatus('Tests completed');
        addLog('🏁 All tests completed');
        
      } catch (error: any) {
        addLog(`💥 Test error: ${error.message}`);
        setStatus('Tests failed');
      }
    };

    runTests();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Auth Debug Page</h1>
      <p><strong>Status:</strong> {status}</p>
      
      <h2>Logs:</h2>
      <div style={{ 
        background: '#f0f0f0', 
        padding: '10px', 
        borderRadius: '5px',
        maxHeight: '400px',
        overflow: 'auto'
      }}>
        {logs.map((log, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            {log}
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
          Go to Login Page
        </a>
      </div>
    </div>
  );
}