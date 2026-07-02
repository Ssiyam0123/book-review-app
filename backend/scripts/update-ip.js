import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  
  for (const name of Object.keys(interfaces)) {
    // Skip virtual adapters like Cloudflare WARP or WSL if standard Ethernet/Wi-Fi is available
    if (name.toLowerCase().includes('warp') || name.toLowerCase().includes('vEthernet') || name.toLowerCase().includes('wsl')) {
      continue;
    }
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (iface.address.startsWith('192.168.')) {
          return iface.address;
        }
        candidates.push(iface.address);
      }
    }
  }
  
  if (candidates.length > 0) {
    return candidates[0];
  }
  
  // Fallback: check all interfaces if filter excluded them
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

function updateEnvFile(filePath, key, value) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const regex = new RegExp(`^${key}=.*$`, 'm');
  
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}`;
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${key} to ${value} in ${path.basename(filePath)}`);
}

const localIp = getLocalIp();
const backendEnvPath = path.resolve(__dirname, '../.env');
const mobileEnvPath = path.resolve(__dirname, '../../mobile/.env');

// Read PORT from backend/.env if it exists, default to 5000
let port = '5000';
if (fs.existsSync(backendEnvPath)) {
  const content = fs.readFileSync(backendEnvPath, 'utf8');
  const portMatch = content.match(/^PORT=(\d+)$/m);
  if (portMatch) {
    port = portMatch[1];
  }
}

updateEnvFile(backendEnvPath, 'API_URL', `http://${localIp}:${port}`);
updateEnvFile(mobileEnvPath, 'EXPO_PUBLIC_API_URL', `http://${localIp}:${port}/api`);
console.log(`IP Update complete! Using local IP: ${localIp}`);
