// Check your current IP address
import https from 'https';

function getCurrentIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.ip);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function checkIP() {
  try {
    const ip = await getCurrentIP();
    console.log('🌐 Your current public IP address is:', ip);
    console.log('📝 Add this IP to your MongoDB Atlas whitelist:');
    console.log('   1. Go to MongoDB Atlas dashboard');
    console.log('   2. Navigate to "Network Access"');
    console.log('   3. Click "Add IP Address"');
    console.log('   4. Add this IP:', ip);
    console.log('   5. Or add 0.0.0.0/0 for development (less secure)');
  } catch (error) {
    console.error('❌ Error getting IP address:', error.message);
  }
}

checkIP();