const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const aiService = require('./src/services/aiService');

dotenv.config();

/**
 * Diagnostic script to verify Gemini AI integration
 * Run with: node test-gemini.js
 */

async function runTest() {
    console.log('--- Murimi Gemini AI Diagnostic ---');

    if (!process.env.GEMINI_API_KEY) {
        console.error('ERROR: GEMINI_API_KEY not found in .env');
        return;
    }

    // Use a sample image if it exists, or a Buffer-like object for simulation
    // For a real test, you'd want to point this to a real crop image
    console.log('Simulating detection with real Gemini API call...');

    try {
        // In a real scenario, we'd read a file:
        // const buffer = fs.readFileSync('sample-leaf.jpg');
        // const result = await aiService.predictDisease(buffer, 'maize');

        // For now, let's just dummy a small buffer if no file is provided 
        // actually let's try to detect if we have any media in the workspace
        const result = await aiService.predictDisease('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2', 'maize');

        console.log('\n✅ AI Response Received:');
        console.log('Disease:', result.disease_name);
        console.log('Confidence:', result.confidence);
        console.log('Translations (SN):', result.translations?.sn?.name);
        console.log('Translations (ND):', result.translations?.nd?.name);

    } catch (err) {
        console.error('\n❌ AI Test Failed:', err.message);
    }
}

runTest();
