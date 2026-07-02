// check-tailwind.js
const fs = require('fs');
const path = require('path');

// console.log('🔍 Checking Tailwind Setup...\n');

// Check files
const files = [
  'tailwind.config.js',
  'babel.config.js',
  'metro.config.js',
  'global.css',
  'package.json'
];

files.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  // console.log(`${exists ? '✅' : '❌'} ${file} ${exists ? 'found' : 'missing'}`);
});

// Check package.json
try {
  const pkg = require('./package.json');
  // console.log('\n📦 Dependencies:');
  // console.log(`✅ nativewind: ${pkg.dependencies?.nativewind || 'NOT FOUND'}`);
  // console.log(`✅ tailwindcss: ${pkg.dependencies?.tailwindcss || 'NOT FOUND'}`);
} catch (e) {
  // console.log('❌ Cannot read package.json');
}
// 
console.log('\n🔄 Run: npx expo start --clear');