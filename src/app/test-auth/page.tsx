"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestAuth() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setResult(`❌ Error: ${error.message}`);
      } else {
        setResult(`✅ Supabase Connected! Session: ${data.session ? "Active" : "None"}`);
      }
    } catch (err) {
      setResult(`❌ Connection failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
    setLoading(false);
  };

  const testSignup = async () => {
    setLoading(true);
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = "Test123456!";
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: "Test User",
          },
        },
      });
      
      if (error) {
        setResult(`❌ Signup Error: ${error.message}`);
      } else if (data.user) {
        setResult(`✅ Signup successful! User ID: ${data.user.id}\nEmail: ${testEmail}\nCheck if email confirmation is required.`);
      } else {
        setResult(`⚠️ Signup returned no error but no user`);
      }
    } catch (err) {
      setResult(`❌ Signup failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">🔧 Authentication Test</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Supabase URL:</p>
            <code className="bg-gray-100 p-2 rounded block text-xs">
              {process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set"}
            </code>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-2">Anon Key (first 20 chars):</p>
            <code className="bg-gray-100 p-2 rounded block text-xs">
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) || "Not set"}...
            </code>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={testConnection}
            disabled={loading}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Supabase Connection"}
          </button>
          
          <button
            onClick={testSignup}
            disabled={loading}
            className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Signup (Creates Random User)"}
          </button>
        </div>

        {result && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p>📝 <strong>How to use:</strong></p>
          <ol className="list-decimal ml-5 mt-2 space-y-1">
            <li>Click &quot;Test Supabase Connection&quot; to verify your credentials</li>
            <li>Click &quot;Test Signup&quot; to create a test user</li>
            <li>Check the result for any errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
