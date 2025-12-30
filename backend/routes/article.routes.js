const express = require("express");
const router = express.Router();

const {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  getArticleBySlug,
} = require("../controllers/article.controller");

// CREATE
router.post("/", createArticle);

// READ
router.get("/", getAllArticles);
router.get("/slug/:slug", getArticleBySlug);
router.get("/:id", getArticleById);

// UPDATE
router.put("/:id", updateArticle);

// DELETE
router.delete("/:id", deleteArticle);

module.exports = router;
