# 🌐 SkillSwap Local Network Setup Guide

This guide will help you run the SkillSwap application on your local network so other devices can access it.

## 🚀 Quick Start

### Method 1: Using the Network Script (Recommended)
```bash
npm run start:network
```

### Method 2: Using the Network Development Command
```bash
npm run dev:network
```

### Method 3: Manual Setup
```bash
# Set environment variables and start
cross-env NODE_ENV=development HOST=0.0.0.0 PORT=3000 npm run dev
```

## 📱 Accessing from Other Devices

Once the server is running, you'll see output like:
```
serving on http://0.0.0.0:3000
Local access: http://localhost:3000
Network access: http://192.168.1.100:3000
```

### From Other Devices on the Same Network:
1. **Smartphones/Tablets**: Open browser and go to `http://YOUR_IP:3000`
2. **Other Computers**: Open browser and go to `http://YOUR_IP:3000`
3. **Replace YOUR_IP** with the IP address shown in the console

## 🔧 Configuration Details

### Environment Variables (.env)
```env
# Server Configuration
HOST=0.0.0.0          # Allows access from any IP
PORT=3000             # Fixed port for consistency
NODE_ENV=development  # Development mode

# Database
MONGODB_URI=mongodb+srv://user:System123@cluster0.bwfouog.mongodb.net/SkillSwap?retryWrites=true&w=majority

# Security
SESSION_SECRET=skillswap-session-secret-change-in-production
```

### Server Configuration
- **Host**: `0.0.0.0` - Binds to all network interfaces
- **Port**: `3000` - Fixed port for easy access
- **HMR**: Configured to work across network
- **CORS**: Automatically handled by the development server

## 🛡️ Security Considerations

### Development Mode (Current Setup)
- ✅ Safe for local network use
- ✅ Firewall protection still active
- ✅ Only accessible on your local network
- ⚠️ Don't expose to the internet without additional security

### For Production Use
If you plan to deploy this for real use:
1. Change `SESSION_SECRET` to a strong, unique value
2. Set up proper HTTPS certificates
3. Configure proper firewall rules
4. Use environment-specific MongoDB credentials

## 🔍 Troubleshooting

### Can't Access from Other Devices?

1. **Check Firewall Settings**
   ```bash
   # Windows: Allow Node.js through Windows Firewall
   # Or temporarily disable firewall for testing
   ```

2. **Verify Network Connection**
   - Ensure all devices are on the same WiFi network
   - Check if the IP address is correct

3. **Check Port Availability**
   ```bash
   # Check if port 3000 is available
   netstat -an | findstr :3000
   ```

4. **Restart the Server**
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run start:network
   ```

### Common Issues

#### "EADDRINUSE" Error
```bash
# Port 3000 is already in use, try a different port
cross-env PORT=3001 npm run dev:network
```

#### MongoDB Connection Issues
```bash
# Test MongoDB connection
node test-mongodb-connection.js
```

#### Network IP Not Showing
- The script will show your local IP automatically
- If it shows 'localhost', check your network adapter settings

## 📋 Network Access Checklist

- [ ] Server starts without errors
- [ ] Console shows network IP address
- [ ] Can access `http://localhost:3000` locally
- [ ] Can access `http://YOUR_IP:3000` from another device
- [ ] All features work (login, registration, etc.)
- [ ] MongoDB connection is stable

## 🎯 Use Cases

### Development Team
- Share development progress with team members
- Test on multiple devices simultaneously
- Demo features to stakeholders

### Testing
- Test responsive design on real devices
- Verify mobile functionality
- Cross-browser compatibility testing

### Presentations
- Demo the application to others
- Show features on larger screens
- Allow audience interaction

## 📞 Getting Help

If you encounter issues:

1. **Check the Console**: Look for error messages in the terminal
2. **Check Browser Console**: Open developer tools on the client device
3. **Verify Network**: Ensure all devices are on the same network
4. **Check Firewall**: Temporarily disable firewall if needed
5. **Restart Everything**: Sometimes a fresh start helps

## 🔄 Switching Back to Local-Only

To switch back to local-only development:
```bash
npm run dev
```

This will run the server in local-only mode (localhost only).

---

**Happy coding! 🚀**

*Made with ❤️ for the SkillSwap community*