const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Murimi App - IP Auto-Configuration Utility
 * This script detects your computer's local network IP and updates 
 * the mobile-app's API configuration so you can test on a physical phone.
 */

const API_FILE_PATH = path.join(__dirname, 'src/services/api.js');

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

function updateApiConfig() {
    const args = process.argv.slice(2);
    const isEmulator = args.includes('--emulator');

    let ip = getLocalIp();
    const port = 3001;

    if (isEmulator) {
        ip = '10.0.2.2'; // Standard Android Emulator loopback
        console.log(`🤖 Emulator Mode: Using 10.0.2.2`);
    } else {
        console.log(`📡 Network Mode: Detected Local IP: ${ip}`);
    }

    const newUrl = `http://${ip}:${port}/api`;

    if (!fs.existsSync(API_FILE_PATH)) {
        console.error(`❌ Error: Could not find ${API_FILE_PATH}`);
        process.exit(1);
    }

    let content = fs.readFileSync(API_FILE_PATH, 'utf8');

    // Replace the API_BASE_URL line
    // Regex matches: const API_BASE_URL = '...';
    const regex = /const API_BASE_URL = ['"].*['"];/;
    const newContent = content.replace(regex, `const API_BASE_URL = '${newUrl}';`);

    if (content === newContent) {
        console.log('ℹ️ API URL is already up to date.');
    } else {
        fs.writeFileSync(API_FILE_PATH, newContent);
        console.log(`✅ Updated API_BASE_URL to: ${newUrl}`);
        console.log(`📱 Now you can open the app on your phone and it will connect to this PC!`);
    }
}

updateApiConfig();
