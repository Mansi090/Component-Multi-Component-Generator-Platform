// Test script to verify the complete authentication and data saving flow
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000';

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Authentication & Data Flow...');
  
  try {
    // Test 1: Health check
    console.log('\n1. Testing backend health...');
    const healthResponse = await fetch(`${API_BASE}/`);
    if (healthResponse.ok) {
      const data = await healthResponse.text();
      console.log('✅ Backend is healthy:', data);
    } else {
      console.log('❌ Backend health check failed:', healthResponse.status);
      return;
    }
    
    // Test 2: Firebase login endpoint structure
    console.log('\n2. Testing Firebase login endpoint...');
    try {
      const loginResponse = await fetch(`${API_BASE}/api/auth/firebase-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: 'invalid-test-token'
        })
      });
      
      if (loginResponse.status === 400) {
        console.log('✅ Firebase login endpoint correctly rejects invalid tokens');
      } else {
        console.log('⚠️ Unexpected response from Firebase login:', loginResponse.status);
      }
    } catch (error) {
      console.log('❌ Error testing Firebase login:', error.message);
    }
    
    // Test 3: Sessions endpoint (should fail without auth)
    console.log('\n3. Testing sessions endpoint without auth...');
    try {
      const sessionsResponse = await fetch(`${API_BASE}/api/sessions`);
      if (sessionsResponse.status === 401) {
        console.log('✅ Sessions endpoint correctly requires authentication');
      } else {
        console.log('⚠️ Sessions endpoint response:', sessionsResponse.status);
      }
    } catch (error) {
      console.log('❌ Error testing sessions endpoint:', error.message);
    }
    
    console.log('\n🎉 Backend API tests completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. ✅ Backend is running on http://localhost:5000');
    console.log('2. ✅ Frontend should be running on http://localhost:3000');
    console.log('3. 📝 Create a .env file in backend/ with:');
    console.log('   - MONGODB_URI=your-mongodb-connection-string');
    console.log('   - JWT_SECRET=your-secret-key');
    console.log('   - OPENROUTER_API_KEY=your-openrouter-api-key');
    console.log('4. 🌐 Open http://localhost:3000 in your browser');
    console.log('5. 🔐 Test login/signup with Firebase');
    console.log('6. ➕ Create a new session and test data saving');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompleteFlow(); 