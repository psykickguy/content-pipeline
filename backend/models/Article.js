const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema(
  {
    // Original article data (Phase 1)
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    originalContent: {
      type: String,
      required: true,
    },

    sourceUrl: {
      type: String,
      required: true,
    },

    // AI-enhanced data (Phase 2)
    enhancedContent: {
      type: String,
      default: null,
    },

    citations: [
      {
        type: String,
      },
    ],

    // Status & metadata
    isEnhanced: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model("Article", ArticleSchema);
