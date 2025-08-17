"use client";

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [message, setMessage] = useState('Client JavaScript not running...');
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('✅ TestPage: useEffect running');
    setMessage('✅ Client JavaScript is working!');
    
    // Test if we can create the Supabase client
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      console.log('🔍 Environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        url: supabaseUrl,
      });
      
      setMessage(prev => prev + ` Environment check: URL=${!!supabaseUrl}, KEY=${!!supabaseKey}`);
    } catch (error: any) {
      console.error('❌ Environment error:', error);
      setMessage(prev => prev + ` Environment error: ${error.message}`);
    }
  }, []);

  const handleClick = () => {
    setCount(prev => prev + 1);
    console.log('🔴 Button clicked, count:', count + 1);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Page</h1>
      <p><strong>Status:</strong> {message}</p>
      <p><strong>Count:</strong> {count}</p>
      
      <button 
        onClick={handleClick}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px', 
          backgroundColor: '#007bff', 
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginRight: '10px'
        }}
      >
        Click me ({count})
      </button>
      
      <a 
        href="/login" 
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px', 
          backgroundColor: '#28a745', 
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          display: 'inline-block'
        }}
      >
        Go to Login
      </a>
      
      <h2>Console Logs:</h2>
      <p>Check the browser console for detailed logs.</p>
      
      <h2>Environment Check:</h2>
      <ul>
        <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Present' : '❌ Missing'}</li>
        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing'}</li>
      </ul>
    </div>
  );
}