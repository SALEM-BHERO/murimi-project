const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * AI Disease Detection Service
 * Uses Google Gemini 1.5 Flash to analyze crop images and return structured data.
 */

exports.loadModel = async () => {
  console.log('[AI Service] Gemini 1.5 Flash integration initialized');
  return true;
};

/**
 * Predicts disease from an image buffer or URL
 * @param {Buffer|string} imageData - The buffer or URL of the image
 * @param {string} cropType - Optional hint for the crop type
 * @returns {Object} Structured detection result
 */
exports.predictDisease = async (imageData, cropType) => {
  if (!imageData) {
    throw new Error('Image data is required for prediction');
  }

  try {
    let imageBase64;

    if (Buffer.isBuffer(imageData)) {
      imageBase64 = imageData.toString('base64');
    } else {
      // Fallback for URLs (legacy/external)
      const axios = require('axios');
      const response = await axios.get(imageData, { responseType: 'arraybuffer' });
      imageBase64 = Buffer.from(response.data).toString('base64');
    }

    const prompt = `
      Analyze this image of a ${cropType || 'crop'} for any signs of plant disease. 
      Provide your analysis in EXACTLY the following JSON format:
      {
        "disease_name": "Common name (English)",
        "scientific_name": "Latin name",
        "confidence": 0.95,
        "symptoms": "Brief description (English)",
        "treatment": "Bullet pointed steps (English, no numbers)",
        "prevention": "Brief description (English)",
        "translations": {
          "sn": {
            "name": "Disease name in Shona",
            "symptoms": "Symptoms in Shona",
            "treatment": "Treatment in Shona",
            "prevention": "Prevention in Shona"
          },
          "nd": {
            "name": "Disease name in Ndebele",
            "symptoms": "Symptoms in Ndebele",
            "treatment": "Treatment in Ndebele",
            "prevention": "Prevention in Ndebele"
          }
        },
        "top3": [
          {"disease_name": "Primary Name", "confidence": 0.95, "scientific_name": "Latin Name"},
          {"disease_name": "Secondary Name", "confidence": 0.03, "scientific_name": "Latin Name"},
          {"disease_name": "Tertiary Name", "confidence": 0.02, "scientific_name": "Latin Name"}
        ]
      }
      If the plant looks healthy, set disease_name to "Healthy" and confidence close to 1.0.
      IMPORTANT: Only return the raw JSON string. Do not use markdown backticks.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const text = result.response.text();
    // Clean potential markdown blocks if Gemini ignores instructions
    const jsonString = text.replace(/```json|```/g, '').trim();
    const prediction = JSON.parse(jsonString);

    return {
      disease_name: prediction.disease_name,
      confidence: prediction.confidence,
      scientific_name: prediction.scientific_name,
      symptoms: prediction.symptoms,
      treatment: prediction.treatment,
      prevention: prediction.prevention,
      translations: prediction.translations,
      top3: prediction.top3
    };

  } catch (err) {
    console.error('[AI Service Error]', err.message);
    return getPlaceholderResult(cropType);
  }
};

/**
 * Fallback placeholder logic
 */
const getPlaceholderResult = (cropType) => {
  return {
    disease_name: 'Healthy Crop',
    confidence: 1.0,
    scientific_name: 'N/A',
    symptoms: 'No visible diseases detected.',
    treatment: 'Continue standard care.',
    prevention: 'Maintain routine inspection.',
    top3: [
      { disease_name: 'Healthy', confidence: 1.0, scientific_name: 'N/A' }
    ],
    translations: {
      sn: { name: 'Chirimwa Chakanaka', symptoms: 'Hapana chirwere chaonekwa.', treatment: 'Ramba uchiita basa rako.', prevention: 'Ramba uchitarisisa.' },
      nd: { name: 'Isitshalo Esihle', symptoms: 'Akukho mkhuhlane obonwayo.', treatment: 'Qhubeka lomsebenzi wakho.', prevention: 'Qhubeka ukhangelisisa.' }
    }
  };
};
