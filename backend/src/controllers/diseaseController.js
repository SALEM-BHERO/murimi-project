const db = require('../models/db');
const aiService = require('../services/aiService');
const imageService = require('../services/imageService');

exports.detectDisease = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { crop_type, lat, lng } = req.body;

    // Process and upload the image (returns url and buffer)
    const processed = await imageService.processAndUpload(req.file);

    // Run AI prediction directly on the image buffer for speed and privacy
    const prediction = await aiService.predictDisease(processed.buffer, crop_type);

    const locationPoint =
      lat && lng ? `POINT(${parseFloat(lng)} ${parseFloat(lat)})` : null;

    const result = await db.query(
      `INSERT INTO detections (user_id, image_url, disease_name, confidence, crop_type, location)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, image_url, disease_name, confidence, crop_type, created_at`,
      [userId, processed.secureUrl, prediction.disease_name, prediction.confidence, crop_type || null, locationPoint]
    );

    res.status(201).json({
      detection: result.rows[0],
      predictions: prediction.top3,
      disease_info: {
        scientific_name: prediction.scientific_name,
        symptoms: prediction.symptoms,
        treatment: prediction.treatment,
        prevention: prediction.prevention,
        translations: prediction.translations // Pass all translations to the frontend
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT id, image_url, disease_name, confidence, crop_type, created_at
       FROM detections
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.getDiseaseInfo = async (req, res, next) => {
  try {
    const { diseaseId } = req.params;
    const result = await db.query(
      `SELECT id, name, scientific_name, affected_crops, symptoms, treatment, prevention, image_url
       FROM diseases
       WHERE id = $1`,
      [diseaseId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Disease not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
