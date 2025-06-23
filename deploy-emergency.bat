@echo off
echo 🚨 EMERGENCY DEPLOYMENT - FIXING PRODUCTION LOGIN ISSUE
echo =======================================================

echo 🔨 Building project...
call npm run build

echo 📦 Deploy to Render with these environment variables:
echo NODE_ENV=production
echo MONGODB_URI=^<your_mongodb_connection_string^>
echo SESSION_SECRET=^<your_secret_key_at_least_32_chars^>

echo.
echo 🎯 After deployment, test with:
echo curl https://swapskill-fj8w.onrender.com/api/health
echo curl -X POST https://swapskill-fj8w.onrender.com/api/login -H "Content-Type: application/json" -d "{\"username\":\"dan\",\"password\":\"dan123\"}"

echo.
echo ✅ Emergency deployment preparation complete!
pause