#!/bin/bash

# Emergency deployment script for SkillSwap production fix
echo "🚨 EMERGENCY DEPLOYMENT - FIXING PRODUCTION LOGIN ISSUE"
echo "======================================================="

# Step 1: Build the project
echo "🔨 Building project..."
npm run build

# Step 2: Test the fixed server locally first
echo "🧪 Testing server locally..."
timeout 10 npm start &
sleep 5

# Test health endpoint
echo "Testing health endpoint..."
curl -s http://localhost:3000/api/health || echo "❌ Health check failed"

# Test login endpoint
echo "Testing login endpoint..."
curl -s -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dan","password":"dan123"}' || echo "❌ Login test failed"

# Kill the test server
pkill -f "npm start" || true

echo "📦 If tests passed, deploy to Render with these environment variables:"
echo "NODE_ENV=production"
echo "MONGODB_URI=<your_mongodb_connection_string>"
echo "SESSION_SECRET=<your_secret_key_at_least_32_chars>"

echo "🎯 After deployment, test with:"
echo "curl https://swapskill-fj8w.onrender.com/api/health"
echo "curl -X POST https://swapskill-fj8w.onrender.com/api/login -H 'Content-Type: application/json' -d '{\"username\":\"dan\",\"password\":\"dan123\"}'"

echo "✅ Emergency deployment preparation complete!"