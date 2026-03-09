const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Local Image Service
 * Saves processed crop images directly to the server's disk.
 * This ensures compatibility in regions where Cloudinary is not supported.
 */

const UPLOADS_PATH = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_PATH)) {
  fs.mkdirSync(UPLOADS_PATH, { recursive: true });
}

exports.processAndUpload = async (file) => {
  if (!file) {
    throw new Error('No image file provided');
  }

  // Generate unique filename
  const filename = `scan_${crypto.randomUUID()}.jpg`;
  const filePath = path.join(UPLOADS_PATH, filename);

  // Process image: resize and compress
  const buffer = await sharp(file.buffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  // Save to local disk
  await fs.promises.writeFile(filePath, buffer);

  // Construct URL accessible by mobile app
  // Using relative path for the DB, server.js handles the mapping
  const secureUrl = `/uploads/${filename}`;

  return {
    secureUrl,
    buffer, // Return the buffer so aiService can use it immediately without reading from disk
    size: buffer.length
  };
};
