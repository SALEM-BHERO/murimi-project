const db = require('../models/db');

exports.listArticles = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, title, category, crop_types, image_url, views
       FROM articles
       ORDER BY views DESC, id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT id, title, content, category, crop_types, image_url, views
       FROM articles
       WHERE id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.listCategories = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT category
       FROM articles
       ORDER BY category ASC`
    );
    res.json(result.rows.map((row) => row.category));
  } catch (err) {
    next(err);
  }
};

