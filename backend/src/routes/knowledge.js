const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');

router.get('/articles', knowledgeController.listArticles);
router.get('/articles/:id', knowledgeController.getArticleById);
router.get('/categories', knowledgeController.listCategories);

module.exports = router;

