const db = require('../models/db');
const locationService = require('../services/locationService');

exports.getNearbyShops = async (req, res, next) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng are required' });
    }

    const searchRadiusKm = parseFloat(radius) || 20;

    const result = await db.query(
      `SELECT id, name, address, phone_number,
              ST_Y(location::geometry) AS lat,
              ST_X(location::geometry) AS lng
       FROM shops`
    );

    const userLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };

    const withDistance = result.rows
      .map((shop) => {
        const distanceKm = locationService.haversineDistance(userLocation, {
          lat: shop.lat,
          lng: shop.lng
        });
        return { ...shop, distance_km: distanceKm };
      })
      .filter((shop) => shop.distance_km <= searchRadiusKm)
      .sort((a, b) => a.distance_km - b.distance_km);

    res.json(withDistance);
  } catch (err) {
    next(err);
  }
};

exports.getShopById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT id, name, address, phone_number,
              ST_Y(location::geometry) AS lat,
              ST_X(location::geometry) AS lng
       FROM shops
       WHERE id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

