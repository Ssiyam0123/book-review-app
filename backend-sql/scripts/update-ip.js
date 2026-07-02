import { networkInterfaces } from 'os';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

function getLocalIp() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal and non-IPv4 addresses
      if (!net.internal && net.family === 'IPv4') {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const updateEnvFile = (filePath, ip) => {
  try {
    let content = readFileSync(filePath, 'utf8');
    const portMatch = content.match(/PORT=(\d+)/);
    const port = portMatch ? portMatch[1] : '5001';

    // Update or append API_URL in backend .env
    const backendUrl = `http://${ip}:${port}`;
    if (content.includes('API_URL=')) {
      content = content.replace(/API_URL=.*/g, `API_URL=${backendUrl}`);
    } else {
      content += `\nAPI_URL=${backendUrl}`;
    }
    writeFileSync(filePath, content);
    console.log(`Updated API_URL to ${backendUrl} in backend-sql/.env`);

    // Update EXPO_PUBLIC_API_URL in mobile .env
    const mobileEnvPath = join(process.cwd(), '..', 'mobile', '.env');
    try {
      let mobileContent = readFileSync(mobileEnvPath, 'utf8');
      const mobileUrl = `http://${ip}:${port}/api`;
      if (mobileContent.includes('EXPO_PUBLIC_API_URL=')) {
        mobileContent = mobileContent.replace(/EXPO_PUBLIC_API_URL=.*/g, `EXPO_PUBLIC_API_URL=${mobileUrl}`);
      } else {
        mobileContent += `\nEXPO_PUBLIC_API_URL=${mobileUrl}`;
      }
      writeFileSync(mobileEnvPath, mobileContent);
      console.log(`Updated EXPO_PUBLIC_API_URL to ${mobileUrl} in mobile/.env`);
    } catch (err) {
      console.log('Mobile .env not found or could not be updated.');
    }

  } catch (error) {
    console.error('Error updating .env files:', error.message);
  }
};

const ip = getLocalIp();
updateEnvFile(join(process.cwd(), '.env'), ip);
console.log(`IP Update complete! Using local IP: ${ip}`);
