const Article = require("../models/Article");

/**
 * CREATE article
 * Used in Phase-1 and optionally Phase-2
 */
exports.createArticle = async (req, res) => {
  try {
    const article = await Article.create(req.body);
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create article",
      error: error.message,
    });
  }
};

/**
 * GET all articles
 */
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch articles",
      error: error.message,
    });
  }
};

/**
 * GET single article by ID
 */
exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(article);
  } catch (error) {
    res.status(400).json({
      message: "Invalid article ID",
      error: error.message,
    });
  }
};

/**
 * UPDATE article (Phase-2 CORE)
 * Safely updates only allowed fields
 */
exports.updateArticle = async (req, res) => {
  try {
    // ✅ Allow ONLY these fields to be updated
    const allowedUpdates = (({
      title,
      enhancedContent,
      isEnhanced,
      citations,
    }) => ({
      title,
      enhancedContent,
      isEnhanced,
      citations,
    }))(req.body);

    const updated = await Article.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update article",
      error: error.message,
    });
  }
};

/**
 * DELETE article
 */
exports.deleteArticle = async (req, res) => {
  try {
    const deleted = await Article.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete article",
      error: error.message,
    });
  }
};

/**
 * GET article by slug
 * Used by frontend / SEO
 */
exports.getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(article);
  } catch (error) {
    res.status(400).json({
      message: "Failed to fetch article",
      error: error.message,
    });
  }
};
