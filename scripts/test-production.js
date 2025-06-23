#!/usr/bin/env node

/**
 * Production Testing Script for SkillSwap
 * This script tests the production deployment on Render
 */

import https from 'https';

const BASE_URL = 'https://swapskill-fj8w.onrender.com';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SkillSwap-Test-Script/1.0'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testProduction() {
  console.log('🚀 Testing SkillSwap Production Deployment');
  console.log('=' .repeat(50));

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthCheck = await makeRequest('/api/health');
    console.log('   Status:', healthCheck.status);
    if (healthCheck.status === 200) {
      console.log('   ✅ Health check passed');
      console.log('   MongoDB:', healthCheck.body.mongodb);
      console.log('   Session:', healthCheck.body.session);
      console.log('   Users:', healthCheck.body.users);
    } else {
      console.log('   ❌ Health check failed');
      console.log('   Response:', healthCheck.body);
    }

    console.log('');

    // Test 2: Login
    console.log('2. Testing Login...');
    const loginResult = await makeRequest('/api/login', 'POST', {
      username: 'dan',
      password: 'dan123'
    });
    
    console.log('   Status:', loginResult.status);
    if (loginResult.status === 200) {
      console.log('   ✅ Login successful');
      console.log('   User:', loginResult.body);
    } else {
      console.log('   ❌ Login failed');
      console.log('   Error:', loginResult.body);
    }

    console.log('');

    // Test 3: Try with other test users
    console.log('3. Testing Login with other users...');
    const testUsers = [
      { username: 'priya_sharma', password: 'password123' },
      { username: 'raj_patel', password: 'password123' }
    ];

    for (const user of testUsers) {
      try {
        const result = await makeRequest('/api/login', 'POST', user);
        console.log(`   ${user.username}: Status ${result.status} ${result.status === 200 ? '✅' : '❌'}`);
        if (result.status !== 200) {
          console.log(`     Error: ${JSON.stringify(result.body)}`);
        }
      } catch (error) {
        console.log(`   ${user.username}: Network Error ❌`);
        console.log(`     ${error.message}`);
      }
    }

    console.log('');

    // Test 4: Try signup with new user
    console.log('4. Testing Signup with new user...');
    const newUser = {
      username: 'testuser_' + Date.now(),
      password: 'testpass123',
      fullName: 'Test User',
      email: 'test@example.com',
      location: 'Test City',
      skillsToTeach: ['Testing'],
      skillsToLearn: ['Programming']
    };

    try {
      const signupResult = await makeRequest('/api/signup', 'POST', newUser);
      console.log('   Signup Status:', signupResult.status);
      if (signupResult.status === 201) {
        console.log('   ✅ Signup successful');
        console.log('   User:', signupResult.body);
      } else {
        console.log('   ❌ Signup failed');
        console.log('   Error:', signupResult.body);
      }
    } catch (error) {
      console.log('   ❌ Signup network error');
      console.log('   Error:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('');
  console.log('🏁 Production testing completed');
}

// Run the test
testProduction().catch(console.error);