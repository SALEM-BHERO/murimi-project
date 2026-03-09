const express = require('express');
const router = express.Router();
const multer = require('multer');
const diseaseController = require('../controllers/diseaseController');
const { requireAuth } = require('../middleware/auth');

// Multer memory storage for image uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

router.post('/detect', requireAuth, upload.single('image'), diseaseController.detectDisease);
router.get('/history', requireAuth, diseaseController.getHistory);
router.get('/info/:diseaseId', diseaseController.getDiseaseInfo);

module.exports = router;
