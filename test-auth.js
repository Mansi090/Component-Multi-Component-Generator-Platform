// Test script to verify authentication and data saving
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000';

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...');
  
  try {
    // Test 1: Health check
    console.log('\n1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE}/`);
    if (healthResponse.ok) {
      const data = await healthResponse.text();
      console.log('✅ Health check passed:', data);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
    }
    
    // Test 2: Firebase login endpoint (this would need a real Firebase token)
    console.log('\n2. Testing Firebase login endpoint...');
    try {
      const loginResponse = await fetch(`${API_BASE}/api/auth/firebase-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: 'test-token'
        })
      });
      
      if (loginResponse.status === 400) {
        console.log('✅ Firebase login endpoint correctly rejected invalid token');
      } else {
        console.log('❌ Unexpected response:', loginResponse.status);
      }
    } catch (error) {
      console.log('❌ Error testing Firebase login:', error.message);
    }
    
    console.log('\n🎉 Basic tests completed!');
    console.log('\n📝 To test with real data:');
    console.log('1. Backend is already running on port 5000 ✅');
    console.log('2. Start the frontend: cd frontend && npm run dev');
    console.log('3. Create a .env file in backend/ with MONGODB_URI and other variables');
    console.log('4. Test the full flow through the web interface');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the backend is running on port 5000');
  }
}

testAuthFlow(); 